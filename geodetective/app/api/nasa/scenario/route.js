
import { NextResponse } from "next/server";
import { getCountryRelatedVariableData } from "@/lib/nasa/power";

// --------------------------------------------------
// 1. Supported investigation scenarios
// --------------------------------------------------

const RELATIONSHIP_SCENARIOS = {
  "temperature-humidity": {
    title: "Temperature and Relative Humidity",
    variableA: "T2M",
    variableB: "RH2M",
    description:
      "Examines how average air temperature and relative humidity vary together.",
  },

  "temperature-precipitation": {
    title: "Temperature and Precipitation",
    variableA: "T2M",
    variableB: "PRECTOTCORR",
    description:
      "Examines the relationship between average air temperature and precipitation.",
  },

  "temperature-dew-point": {
    title: "Temperature and Dew Point",
    variableA: "T2M",
    variableB: "T2MDEW",
    description:
      "Examines how average air temperature and dew point temperature vary together.",
  },

  "precipitation-humidity": {
    title: "Precipitation and Relative Humidity",
    variableA: "PRECTOTCORR",
    variableB: "RH2M",
    description:
      "Examines the relationship between precipitation and relative humidity.",
  },

  "temperature-wind": {
    title: "Temperature and Wind Speed",
    variableA: "T2M",
    variableB: "WS10M",
    description:
      "Examines the relationship between average air temperature and wind speed.",
  },
};

const EXPLANATION_SCENARIOS = {
  "rainfall-change": {
    title: "Understanding Changes in Rainfall",
    target: "PRECTOTCORR",
    related: ["T2M", "RH2M", "WS10M"],
    question: "Why is rainfall changing in this region?",
    explanation:
      "Rainfall patterns can be associated with atmospheric temperature, humidity, and wind conditions. This investigation examines how these variables have varied alongside precipitation. Their correlations can identify associations, but cannot establish which factors caused rainfall to change.",
  },

  "heat-change": {
    title: "Understanding Temperature Changes",
    target: "T2M",
    related: ["RH2M", "T2MDEW", "TS", "QV2M"],
    question: "What environmental variables are associated with temperature changes?",
    explanation:
      "Temperature can vary alongside humidity, dew point, surface temperature, and atmospheric moisture. This investigation compares these measurements with average air temperature to identify associated patterns. Correlation alone cannot establish the physical cause of a temperature change.",
  },

  "humidity-change": {
    title: "Understanding Humidity Changes",
    target: "RH2M",
    related: ["T2M", "T2MDEW", "QV2M", "PRECTOTCORR"],
    question: "What environmental variables are associated with humidity changes?",
    explanation:
      "Relative humidity is related to atmospheric moisture and temperature conditions. This investigation examines its association with air temperature, dew point, specific humidity, and precipitation. These relationships provide evidence of patterns, not proof of causation.",
  },

  "drought-conditions": {
    title: "Understanding Environmental Conditions Associated with Drought",
    target: "PRECTOTCORR",
    related: ["T2M", "RH2M", "WS10M"],
    question: "What environmental conditions are associated with dry conditions?",
    explanation:
      "Low precipitation is an important indicator of dry conditions. Temperature, humidity, and wind may also vary during dry periods. This investigation examines their statistical relationships with precipitation. It does not calculate an official drought index or independently confirm drought events.",
  },

  "surface-temperature": {
    title: "Understanding Surface Temperature Changes",
    target: "TS",
    related: ["T2M", "ALLSKY_SFC_SW_DWN", "WS10M"],
    question: "What environmental variables are associated with surface temperature changes?",
    explanation:
      "Earth's surface temperature can vary alongside air temperature, incoming solar radiation, and wind conditions. This investigation compares these measurements to identify statistical associations. Correlation does not establish that any one variable caused surface temperature changes.",
  },
};

// --------------------------------------------------
// 2. Variable information
// --------------------------------------------------

const VARIABLE_INFO = {
  T2M: {
    name: "Average Air Temperature",
    unit: "°C",
  },
  RH2M: {
    name: "Relative Humidity",
    unit: "%",
  },
  PRECTOTCORR: {
    name: "Precipitation",
    unit: "mm/day",
  },
  T2MDEW: {
    name: "Dew Point Temperature",
    unit: "°C",
  },
  WS10M: {
    name: "Wind Speed at 10 Metres",
    unit: "m/s",
  },
  TS: {
    name: "Earth Skin Temperature",
    unit: "°C",
  },
  QV2M: {
    name: "Specific Humidity",
    unit: "g/kg",
  },
  ALLSKY_SFC_SW_DWN: {
    name: "Shortwave Solar Radiation",
    unit: "kWh/m²/day",
  },
};

// --------------------------------------------------
// 3. Country detection
// --------------------------------------------------

const SUPPORTED_COUNTRIES = [
  {
    name: "Qatar",
    aliases: ["qatar"],
  },
  {
    name: "India",
    aliases: ["india"],
  },
  {
    name: "Bangladesh",
    aliases: ["bangladesh"],
  },
  {
    name: "United States",
    aliases: ["united states", "usa", "u.s.a.", "u.s.", "us"],
  },
  {
    name: "United Kingdom",
    aliases: ["united kingdom", "uk", "u.k.", "britain", "great britain"],
  },
];

function detectCountry(question, suppliedCountry) {
  if (suppliedCountry) {
    return suppliedCountry;
  }

  const normalizedQuestion = String(question || "").toLowerCase();

  for (const country of SUPPORTED_COUNTRIES) {
    if (
      country.aliases.some((alias) => {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`, "i").test(normalizedQuestion);
      })
    ) {
      return country.name;
    }
  }

  return "Qatar";
}

// --------------------------------------------------
// 4. Statistical functions
// --------------------------------------------------

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
  const mean = calculateMean(values);

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;

  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation === 0) {
    return values.map(() => 0);
  }

  return values.map((value) => (value - mean) / standardDeviation);
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
    return "There is not enough variation or paired data to calculate a reliable correlation.";
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

// --------------------------------------------------
// 5. Convert daily measurements into annual averages
// --------------------------------------------------

function createAnnualData(observations, variableIds) {
  const yearlyValues = new Map();

  for (const observation of observations) {
    const year = observation.date.substring(0, 4);

    if (!yearlyValues.has(year)) {
      yearlyValues.set(year, { year });
    }

    const annualRecord = yearlyValues.get(year);

    for (const variableId of variableIds) {
      const value = observation[variableId];

      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      if (!annualRecord[variableId]) {
        annualRecord[variableId] = [];
      }

      annualRecord[variableId].push(value);
    }
  }

  return Array.from(yearlyValues.values())
    .map((record) => {
      const annualRecord = { year: Number(record.year) };

      for (const variableId of variableIds) {
        annualRecord[variableId] = calculateMean(
          record[variableId] || [],
        );
      }

      return annualRecord;
    })
    .sort((a, b) => a.year - b.year);
}

// --------------------------------------------------
// 6. Compare two variables
// --------------------------------------------------

function compareVariables(annualData, variableAId, variableBId) {
  const variableA = VARIABLE_INFO[variableAId];
  const variableB = VARIABLE_INFO[variableBId];

  const pairedData = annualData.filter(
    (record) =>
      Number.isFinite(record[variableAId]) &&
      Number.isFinite(record[variableBId]),
  );

  if (pairedData.length < 10) {
    return {
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
      interpretation:
        "At least 10 paired annual observations are required for this comparison.",
      comparisonData: [],
    };
  }

  const valuesA = pairedData.map((record) => record[variableAId]);
  const valuesB = pairedData.map((record) => record[variableBId]);

  const detrendedA = calculateLinearTrend(valuesA);
  const detrendedB = calculateLinearTrend(valuesB);

  const correlation = calculatePearsonCorrelation(
    detrendedA,
    detrendedB,
  );

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
    variableA: {
      id: variableAId,
      ...variableA,
    },
    variableB: {
      id: variableBId,
      ...variableB,
    },
    correlation:
      correlation === null ? null : Number(correlation.toFixed(4)),
    strength: getCorrelationStrength(correlation),
    direction: getCorrelationDirection(correlation),
    sampleSize: pairedData.length,
    interpretation: getCorrelationInterpretation(
      correlation,
      variableA,
      variableB,
    ),
    comparisonData,
  };
}

// --------------------------------------------------
// 7. API endpoint
// --------------------------------------------------

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      type,
      scenarioId,
      question = "",
      startYear = 1981,
      endYear = 2024,
    } = body;

    if (!["relationship", "explanation"].includes(type)) {
      return NextResponse.json(
        { error: "Unsupported investigation type." },
        { status: 400 },
      );
    }

    const scenarios =
      type === "relationship"
        ? RELATIONSHIP_SCENARIOS
        : EXPLANATION_SCENARIOS;

    const scenario = scenarios[scenarioId];

    if (!scenario) {
      return NextResponse.json(
        { error: "This investigation scenario is not supported yet." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < 1981 ||
      endYear < startYear ||
      endYear > new Date().getFullYear()
    ) {
      return NextResponse.json(
        { error: "Please provide a valid study period." },
        { status: 400 },
      );
    }

    const country = detectCountry(question, body.country);

    // Retrieve the NASA POWER measurements for the selected country.
    const nasaData = await getCountryRelatedVariableData({
      country,
      startYear,
      endYear,
    });

    const variableIds =
      type === "relationship"
        ? [scenario.variableA, scenario.variableB]
        : [scenario.target, ...scenario.related];

    const annualData = createAnnualData(
      nasaData.observations,
      variableIds,
    );

    let results;

    if (type === "relationship") {
      const comparison = compareVariables(
        annualData,
        scenario.variableA,
        scenario.variableB,
      );

      results = {
        primaryComparison: comparison,
      };
    } else {
      const comparisons = scenario.related.map((relatedVariableId) =>
        compareVariables(
          annualData,
          scenario.target,
          relatedVariableId,
        ),
      );

      comparisons.sort(
        (a, b) =>
          Math.abs(b.correlation ?? 0) -
          Math.abs(a.correlation ?? 0),
      );

      results = {
        targetVariable: {
          id: scenario.target,
          ...VARIABLE_INFO[scenario.target],
        },
        comparisons,
      };
    }

    return NextResponse.json({
      success: true,
      type,
      scenarioId,
      title: scenario.title,
      description: scenario.description || scenario.explanation,
      question: scenario.question || question,
      explanation:
        type === "explanation" ? scenario.explanation : null,
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
        minimumPairedYears: 10,
      },
      results,
    });
  } catch (error) {
    console.error("NASA scenario API error:", error);

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
