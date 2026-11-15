import { NextResponse } from "next/server";
import { getCountryRelatedVariableData } from "@/lib/nasa/power";

function getYear(date) {
  const value = String(date ?? "");
  const match = value.match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function isValidNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) !== -999
  );
}

function calculateAnnualAverages(observations, variableCodes) {
  const yearlyValues = new Map();

  for (const observation of observations ?? []) {
    const year = getYear(observation.date);

    if (!year) continue;

    if (!yearlyValues.has(year)) {
      yearlyValues.set(year, { year, sums: {}, counts: {} });
    }

    const yearData = yearlyValues.get(year);

    for (const code of variableCodes) {
      const value = observation[code];

      if (!isValidNumber(value)) continue;

      yearData.sums[code] = (yearData.sums[code] ?? 0) + Number(value);

      yearData.counts[code] = (yearData.counts[code] ?? 0) + 1;
    }
  }

  return [...yearlyValues.values()]
    .sort((a, b) => a.year - b.year)
    .map((yearData) => {
      const result = { year: yearData.year };

      for (const code of variableCodes) {
        const count = yearData.counts[code] ?? 0;

        result[code] = count > 0 ? yearData.sums[code] / count : null;
      }

      return result;
    });
}

// Removes the linear trend from a series using least-squares regression.
function detrend(values) {
  const n = values.length;

  if (n < 2) return values.map(() => null);

  const meanX = values.reduce((sum, item) => sum + item.year, 0) / n;

  const meanY = values.reduce((sum, item) => sum + item.value, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (const item of values) {
    numerator += (item.year - meanX) * (item.value - meanY);
    denominator += (item.year - meanX) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  return values.map((item) => ({
    year: item.year,
    value: item.value - (intercept + slope * item.year),
  }));
}

function pearsonCorrelation(valuesA, valuesB) {
  if (valuesA.length !== valuesB.length || valuesA.length < 2) {
    return null;
  }

  const n = valuesA.length;

  const meanA = valuesA.reduce((sum, value) => sum + value, 0) / n;

  const meanB = valuesB.reduce((sum, value) => sum + value, 0) / n;

  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;

  for (let i = 0; i < n; i++) {
    const differenceA = valuesA[i] - meanA;
    const differenceB = valuesB[i] - meanB;

    covariance += differenceA * differenceB;
    varianceA += differenceA ** 2;
    varianceB += differenceB ** 2;
  }

  const denominator = Math.sqrt(varianceA * varianceB);

  if (denominator === 0) return null;

  return covariance / denominator;
}

function getCorrelationStrength(correlation) {
  const absoluteValue = Math.abs(correlation);

  if (absoluteValue >= 0.8) return "Very strong";
  if (absoluteValue >= 0.6) return "Strong";
  if (absoluteValue >= 0.4) return "Moderate";
  if (absoluteValue >= 0.2) return "Weak";

  return "Very weak";
}

function getCorrelationDirection(correlation) {
  if (correlation > 0) return "Positive";
  if (correlation < 0) return "Negative";

  return "No direction";
}

function getVariableCode(variable) {
  return variable.code ?? variable.id ?? variable.parameter ?? variable.name;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const country = body.country || "Qatar";
    const startYear = Number(body.startYear ?? 1981);
    const endYear = Number(body.endYear ?? 2024);

    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < 1981 ||
      endYear < startYear
    ) {
      return NextResponse.json(
        { error: "Please provide a valid study period." },
        { status: 400 },
      );
    }

    const nasaData = await getCountryRelatedVariableData({
      country,
      startYear,
      endYear,
    });

    const variables = nasaData.variables ?? [];

    const variableCodes = [
      "T2M",
      ...variables.map(getVariableCode).filter(Boolean),
    ];

    const annualData = calculateAnnualAverages(nasaData.observations, [
      ...new Set(variableCodes),
    ]);

    const results = [];

    for (const variable of variables) {
      const code = getVariableCode(variable);

      if (!code || code === "T2M") continue;

      const pairedData = annualData
        .filter((item) => isValidNumber(item.T2M) && isValidNumber(item[code]))
        .map((item) => ({
          year: item.year,
          temperature: Number(item.T2M),
          variable: Number(item[code]),
        }));

      // Require enough annual observations for a meaningful comparison.
      if (pairedData.length < 10) {
        results.push({
          code,
          name: variable.name ?? variable.label ?? code,
          unit: variable.unit ?? "",
          correlation: null,
          rawCorrelation: null,
          strength: "Insufficient data",
          direction: null,
          sampleYears: pairedData.length,
          comparisonData: [],
        });

        continue;
      }

      const temperatureSeries = pairedData.map((item) => ({
        year: item.year,
        value: item.temperature,
      }));

      const variableSeries = pairedData.map((item) => ({
        year: item.year,
        value: item.variable,
      }));

      const detrendedTemperature = detrend(temperatureSeries);
      const detrendedVariable = detrend(variableSeries);

      const correlation = pearsonCorrelation(
        detrendedTemperature.map((item) => item.value),
        detrendedVariable.map((item) => item.value),
      );

      const rawCorrelation = pearsonCorrelation(
        pairedData.map((item) => item.temperature),
        pairedData.map((item) => item.variable),
      );

      const comparisonData = pairedData.map((item, index) => ({
        year: item.year,
        temperature: item.temperature,
        variable: item.variable,
        temperatureAnomaly: detrendedTemperature[index].value,
        variableAnomaly: detrendedVariable[index].value,
      }));

      results.push({
        code,
        name: variable.name ?? variable.label ?? code,
        unit: variable.unit ?? "",
        correlation,
        rawCorrelation,
        strength:
          correlation === null
            ? "Insufficient data"
            : getCorrelationStrength(correlation),
        direction:
          correlation === null ? null : getCorrelationDirection(correlation),
        sampleYears: pairedData.length,
        comparisonData,
      });
    }

    results.sort((a, b) => {
      if (a.correlation === null) return 1;
      if (b.correlation === null) return -1;

      return Math.abs(b.correlation) - Math.abs(a.correlation);
    });

    return NextResponse.json({
      location: nasaData.location,
      studyPeriod: {
        startYear,
        endYear,
      },
      referenceVariable: {
        code: "T2M",
        name: "2-metre air temperature",
        unit: "°C",
      },
      dataSource: nasaData.source,
      sampledLocations: nasaData.sampledLocations,
      spatialMethod: nasaData.spatialMethod,
      correlationMethod:
        "Pearson correlation of annual values after removing each variable's long-term linear trend.",
      results,
    });
  } catch (error) {
    console.error("Correlation API error:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Unable to calculate related-variable correlations.",
      },
      { status: 500 },
    );
  }
}
