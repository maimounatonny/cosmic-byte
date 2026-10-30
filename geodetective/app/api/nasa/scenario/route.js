import { NextResponse } from "next/server";
import {
  ENVIRONMENTAL_VARIABLES,
  getCountryEnvironmentalData,
  getVariableInfo,
} from "@/lib/nasa/power";

const MIN_YEAR = 1981;
const MAX_YEAR = 2024;
const MINIMUM_PAIRED_YEARS = 10;

function calculateMean(values) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateLinearTrend(values) {
  const n = values.length;

  if (n < 2) return values.slice();

  const xMean = (n - 1) / 2;
  const yMean = calculateMean(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;

  const intercept = yMean - slope * xMean;

  return values.map((value, index) => value - (intercept + slope * index));
}

function calculatePearsonCorrelation(x, y) {
  if (x.length !== y.length || x.length < 2) {
    return null;
  }

  const xMean = calculateMean(x);
  const yMean = calculateMean(y);

  let numerator = 0;
  let xSumSquares = 0;
  let ySumSquares = 0;

  for (let i = 0; i < x.length; i++) {
    const xDifference = x[i] - xMean;
    const yDifference = y[i] - yMean;

    numerator += xDifference * yDifference;
    xSumSquares += xDifference ** 2;
    ySumSquares += yDifference ** 2;
  }

  const denominator = Math.sqrt(xSumSquares * ySumSquares);

  if (denominator === 0) return null;

  return numerator / denominator;
}

function calculateStandardizedValues(values) {
  const average = calculateMean(values);

  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length;

  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation === 0) {
    return values.map(() => 0);
  }

  return values.map((value) => (value - average) / standardDeviation);
}

function getCorrelationStrength(correlation) {
  if (correlation === null) return "Insufficient data";

  const absoluteValue = Math.abs(correlation);

  if (absoluteValue >= 0.8) return "Very strong";
  if (absoluteValue >= 0.6) return "Strong";
  if (absoluteValue >= 0.4) return "Moderate";
  if (absoluteValue >= 0.2) return "Weak";

  return "Very weak";
}

function getCorrelationDirection(correlation) {
  if (correlation === null) return "Unavailable";
  if (correlation > 0) return "Positive";
  if (correlation < 0) return "Negative";

  return "No linear relationship";
}

function getCorrelationInterpretation(correlation, variableA, variableB) {
  if (correlation === null) {
    return "There is not enough variation or paired data to calculate a correlation.";
  }

  const strength = getCorrelationStrength(correlation).toLowerCase();

  if (correlation > 0) {
    return `There is a ${strength} positive association between ${variableA.name} and ${variableB.name}. Higher values of one tend to occur alongside higher values of the other.`;
  }

  if (correlation < 0) {
    return `There is a ${strength} negative association between ${variableA.name} and ${variableB.name}. Higher values of one tend to occur alongside lower values of the other.`;
  }

  return `There is no measurable linear association between ${variableA.name} and ${variableB.name} in this dataset.`;
}

function createAnnualData(observations, variableIds) {
  const yearlyValues = new Map();

  for (const observation of observations) {
    const year = Number(observation.date?.substring(0, 4));

    if (!Number.isInteger(year)) continue;

    if (!yearlyValues.has(year)) {
      yearlyValues.set(year, { year });
    }

    const annualRecord = yearlyValues.get(year);

    for (const variableId of variableIds) {
      const value = observation[variableId];

      if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
      ) {
        continue;
      }

      if (!annualRecord[variableId]) {
        annualRecord[variableId] = [];
      }

      annualRecord[variableId].push(Number(value));
    }
  }

  return Array.from(yearlyValues.values())
    .map((record) => {
      const annualRecord = { year: record.year };

      for (const variableId of variableIds) {
        annualRecord[variableId] = calculateMean(record[variableId] || []);
      }

      return annualRecord;
    })
    .sort((a, b) => a.year - b.year);
}

function compareVariables(annualData, variableAId, variableBId) {
  const variableA = getVariableInfo(variableAId);
  const variableB = getVariableInfo(variableBId);

  const pairedData = annualData.filter(
    (record) =>
      Number.isFinite(record[variableAId]) &&
      Number.isFinite(record[variableBId]),
  );

  const baseResult = {
    variableA: {
      id: variableAId,
      ...variableA,
    },
    variableB: {
      id: variableBId,
      ...variableB,
    },
    correlation: null,
    strength: "Insufficient data",
    direction: "Unavailable",
    sampleSize: pairedData.length,
    interpretation: `At least ${MINIMUM_PAIRED_YEARS} paired annual observations are required for this comparison.`,
    comparisonData: [],
  };

  if (pairedData.length < MINIMUM_PAIRED_YEARS) {
    return baseResult;
  }

  const valuesA = pairedData.map((record) => record[variableAId]);

  const valuesB = pairedData.map((record) => record[variableBId]);

  const detrendedA = calculateLinearTrend(valuesA);
  const detrendedB = calculateLinearTrend(valuesB);

  const correlation = calculatePearsonCorrelation(detrendedA, detrendedB);

  const standardizedA = calculateStandardizedValues(detrendedA);

  const standardizedB = calculateStandardizedValues(detrendedB);

  const comparisonData = pairedData.map((record, index) => ({
    year: record.year,
    [variableAId]: valuesA[index],
    [variableBId]: valuesB[index],
    variableAAnomaly: standardizedA[index],
    variableBAnomaly: standardizedB[index],
  }));

  return {
    ...baseResult,
    correlation: correlation === null ? null : Number(correlation.toFixed(4)),
    strength: getCorrelationStrength(correlation),
    direction: getCorrelationDirection(correlation),
    interpretation: getCorrelationInterpretation(
      correlation,
      variableA,
      variableB,
    ),
    comparisonData,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const type = body.type;
    const country = body.country || "Qatar";
    const variable = body.variable;
    const secondVariable = body.secondVariable;

    const startYear = Number(body.startYear);
    const endYear = Number(body.endYear);

    if (!["relationship", "explanation"].includes(type)) {
      return NextResponse.json(
        { error: "Unsupported investigation type." },
        { status: 400 },
      );
    }

    if (!variable || !getVariableInfo(variable)) {
      return NextResponse.json(
        { error: "Please select a supported target variable." },
        { status: 400 },
      );
    }

    if (
      type === "relationship" &&
      (!secondVariable || !getVariableInfo(secondVariable))
    ) {
      return NextResponse.json(
        { error: "Please select a supported second variable." },
        { status: 400 },
      );
    }

    if (type === "relationship" && variable === secondVariable) {
      return NextResponse.json(
        { error: "Please select two different variables." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < MIN_YEAR ||
      endYear > MAX_YEAR ||
      endYear < startYear ||
      endYear - startYear + 1 < MINIMUM_PAIRED_YEARS
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid study period between 1981 and 2024 containing at least 10 years.",
        },
        { status: 400 },
      );
    }

    const variableIds =
      type === "relationship"
        ? [variable, secondVariable]
        : ENVIRONMENTAL_VARIABLES.map((item) => item.id);

    const nasaData = await getCountryEnvironmentalData({
      country,
      variableIds,
      startYear,
      endYear,
    });

    const annualData = createAnnualData(nasaData.observations, variableIds);

    let results;

    if (type === "relationship") {
      const comparison = compareVariables(annualData, variable, secondVariable);

      results = {
        primaryComparison: comparison,
      };
    } else {
      const relatedVariables = ENVIRONMENTAL_VARIABLES.filter(
        (item) => item.id !== variable,
      ).map((item) => item.id);

      const comparisons = relatedVariables.map((relatedVariableId) =>
        compareVariables(annualData, variable, relatedVariableId),
      );

      comparisons.sort((a, b) => {
        const aValue = a.correlation === null ? -1 : Math.abs(a.correlation);

        const bValue = b.correlation === null ? -1 : Math.abs(b.correlation);

        return bValue - aValue;
      });

      results = {
        targetVariable: {
          id: variable,
          ...getVariableInfo(variable),
        },
        comparisons,
      };
    }

    const title =
      type === "relationship"
        ? `${getVariableInfo(variable).name} and ${getVariableInfo(secondVariable).name}`
        : `Environmental factors associated with ${getVariableInfo(variable).name}`;

    const description =
      type === "relationship"
        ? `This investigation examines the statistical relationship between ${getVariableInfo(variable).name.toLowerCase()} and ${getVariableInfo(secondVariable).name.toLowerCase()}.`
        : `This investigation compares ${getVariableInfo(variable).name.toLowerCase()} with the other supported NASA environmental variables to identify statistical associations.`;

    return NextResponse.json({
      success: true,
      type,
      title,
      description,
      explanation:
        type === "explanation"
          ? "The comparisons identify environmental variables that move alongside the selected target variable. These are statistical associations and do not establish that one variable caused another to change."
          : null,
      location: nasaData.location,
      studyPeriod: {
        startYear,
        endYear,
      },
      dataSource: nasaData.source,
      sampledLocations: nasaData.sampledLocations,
      spatialMethod: nasaData.spatialMethod,
      annualObservationCount: annualData.length,
      methodology: {
        aggregation: "Annual averages of daily measurements.",
        correlation:
          "Pearson correlation calculated using detrended annual values.",
        detrending:
          "A linear trend is removed from each annual series before correlation is calculated.",
        minimumPairedYears: MINIMUM_PAIRED_YEARS,
      },
      results,
    });
  } catch (error) {
    console.error("NASA environmental comparison API error:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while analysing the NASA data.",
      },
      { status: 500 },
    );
  }
}
