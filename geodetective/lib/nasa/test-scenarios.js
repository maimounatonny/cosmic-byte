
export const TEST_VARIABLES = {
  T2M: {
    code: "T2M",
    name: "Air Temperature",
    unit: "°C",
  },
  PRECTOTCORR: {
    code: "PRECTOTCORR",
    name: "Corrected Precipitation",
    unit: "mm/day",
  },
  RH2M: {
    code: "RH2M",
    name: "Relative Humidity",
    unit: "%",
  },
  QV2M: {
    code: "QV2M",
    name: "Specific Humidity",
    unit: "g/kg",
  },
  T2MDEW: {
    code: "T2MDEW",
    name: "Dew Point Temperature",
    unit: "°C",
  },
  WS10M: {
    code: "WS10M",
    name: "Wind Speed at 10 Metres",
    unit: "m/s",
  },
  ALLSKY_SFC_SW_DWN: {
    code: "ALLSKY_SFC_SW_DWN",
    name: "Solar Radiation",
    unit: "MJ/m²/day",
  },
};

// Five predefined variable comparisons.
// The first variable is always the reference variable.
export const RELATIONSHIP_TESTS = [
  {
    id: "temperature-rainfall",
    question: "Does rainfall relate to temperature?",
    variableA: "T2M",
    variableB: "PRECTOTCORR",
  },
  {
    id: "temperature-humidity",
    question: "Does humidity relate to temperature?",
    variableA: "T2M",
    variableB: "RH2M",
  },
  {
    id: "temperature-dewpoint",
    question: "Does dew point relate to air temperature?",
    variableA: "T2M",
    variableB: "T2MDEW",
  },
  {
    id: "temperature-solar",
    question: "Does solar radiation relate to temperature?",
    variableA: "T2M",
    variableB: "ALLSKY_SFC_SW_DWN",
  },
  {
    id: "temperature-wind",
    question: "Does wind speed relate to temperature?",
    variableA: "T2M",
    variableB: "WS10M",
  },
];

// Predefined environmental explanation scenarios.
// The main variable is compared with each candidate variable.
export const EXPLANATION_TESTS = [
  {
    id: "rainfall-decrease",
    question: "Why is rainfall decreasing?",
    mainVariable: "PRECTOTCORR",
    relatedVariables: [
      "T2M",
      "RH2M",
      "QV2M",
      "T2MDEW",
      "WS10M",
    ],
    explanation:
      "These variables can help explore possible atmospheric relationships with changing rainfall.",
  },
  {
    id: "temperature-increase",
    question: "Why is temperature increasing?",
    mainVariable: "T2M",
    relatedVariables: [
      "ALLSKY_SFC_SW_DWN",
      "PRECTOTCORR",
      "RH2M",
      "WS10M",
      "T2MDEW",
    ],
    explanation:
      "These variables can help explore possible relationships with changing air temperature.",
  },
  {
    id: "humidity-change",
    question: "Why is humidity changing?",
    mainVariable: "RH2M",
    relatedVariables: [
      "T2M",
      "T2MDEW",
      "PRECTOTCORR",
      "QV2M",
      "WS10M",
    ],
    explanation:
      "These variables can help explore possible atmospheric relationships with changing relative humidity.",
  },
];

// Helper: retrieve a variable's information using its NASA code.
export function getTestVariable(code) {
  return TEST_VARIABLES[code] ?? null;
}

// Helper: find a predefined relationship question.
export function findRelationshipTest(question) {
  if (!question) return null;

  const normalizedQuestion = question.trim().toLowerCase();

  return (
    RELATIONSHIP_TESTS.find(
      (test) => test.question.toLowerCase() === normalizedQuestion
    ) ?? null
  );
}

// Helper: find a predefined explanation question.
export function findExplanationTest(question) {
  if (!question) return null;

  const normalizedQuestion = question.trim().toLowerCase();

  return (
    EXPLANATION_TESTS.find(
      (test) => test.question.toLowerCase() === normalizedQuestion
    ) ?? null
  );
}
