
const SIGNIFICANCE_LEVEL = 0.05;

function mean(values) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) /
    values.length;
}

// Lanczos approximation for the log-gamma function.
function logGamma(z) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019571e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return (
      Math.log(Math.PI) -
      Math.log(Math.sin(Math.PI * z)) -
      logGamma(1 - z)
    );
  }

  z -= 1;
  let x = 0.9999999999998099;

  for (let i = 0; i < coefficients.length; i++) {
    x += coefficients[i] / (z + i + 1);
  }

  const t = z + coefficients.length - 0.5;

  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  );
}

function betaFraction(a, b, x) {
  const maxIterations = 200;
  const epsilon = 3e-14;
  const minimum = 1e-300;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;

  if (Math.abs(d) < minimum) d = minimum;

  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;

    let aa =
      (m * (b - m) * x) /
      ((qam + m2) * (a + m2));

    d = 1 + aa * d;
    if (Math.abs(d) < minimum) d = minimum;

    c = 1 + aa / c;
    if (Math.abs(c) < minimum) c = minimum;

    d = 1 / d;
    h *= d * c;

    aa =
      -((a + m) * (qab + m) * x) /
      ((a + m2) * (qap + m2));

    d = 1 + aa * d;
    if (Math.abs(d) < minimum) d = minimum;

    c = 1 + aa / c;
    if (Math.abs(c) < minimum) c = minimum;

    d = 1 / d;

    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < epsilon) break;
  }

  return h;
}

function incompleteBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const front = Math.exp(
    logGamma(a + b) -
    logGamma(a) -
    logGamma(b) +
    a * Math.log(x) +
    b * Math.log(1 - x),
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaFraction(a, b, x)) / a;
  }

  return (
    1 -
    (front * betaFraction(b, a, 1 - x)) / b
  );
}

function calculatePValue(tStatistic, degreesOfFreedom) {
  if (degreesOfFreedom <= 0) return null;

  if (!Number.isFinite(tStatistic)) {
    return 0;
  }

  const x =
    degreesOfFreedom /
    (degreesOfFreedom + tStatistic ** 2);

  return incompleteBeta(
    x,
    degreesOfFreedom / 2,
    0.5,
  );
}

function calculateAnnualAverages(observations, variableId) {
  const yearlyValues = new Map();

  for (const observation of observations) {
    const rawValue = observation[variableId];

    if (
      rawValue === null ||
      rawValue === undefined
    ) {
      continue;
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value) || value === -999) {
      continue;
    }

    const year = Number(observation.date?.slice(0, 4));

    if (!Number.isInteger(year)) continue;

    if (!yearlyValues.has(year)) {
      yearlyValues.set(year, []);
    }

    yearlyValues.get(year).push(value);
  }

  return Array.from(yearlyValues.entries())
    .map(([year, values]) => {
      const annualAverage = mean(values);

      return {
        year,
        value: annualAverage,
        // Compatibility with the previous temperature chart.
        averageTemperature: annualAverage,
        observationCount: values.length,
      };
    })
    .sort((a, b) => a.year - b.year);
}

function calculateLinearRegression(data) {
  const n = data.length;

  if (n < 10) {
    throw new Error(
      "At least 10 annual observations are required for trend analysis.",
    );
  }

  const years = data.map((item) => item.year);
  const values = data.map((item) => item.value);

  const averageYear = mean(years);
  const averageValue = mean(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator +=
      (years[i] - averageYear) *
      (values[i] - averageValue);

    denominator +=
      (years[i] - averageYear) ** 2;
  }

  if (denominator === 0) {
    throw new Error("Unable to calculate the trend.");
  }

  const slope = numerator / denominator;
  const intercept = averageValue - slope * averageYear;

  const residualSum = values.reduce(
    (sum, value, index) => {
      const predicted = intercept + slope * years[index];

      return sum + (value - predicted) ** 2;
    },
    0,
  );

  const standardError = Math.sqrt(
    residualSum / (n - 2) / denominator,
  );

  const tStatistic =
    standardError === 0
      ? slope === 0
        ? 0
        : Math.sign(slope) * Infinity
      : slope / standardError;

  const pValue =
    standardError === 0
      ? slope === 0
        ? 1
        : 0
      : calculatePValue(tStatistic, n - 2);

  return {
    slope,
    pValue,
    totalChange:
      slope * (Math.max(...years) - Math.min(...years)),
    startYear: Math.min(...years),
    endYear: Math.max(...years),
    yearsAnalyzed: n,
    direction:
      slope > 0
        ? "increasing"
        : slope < 0
          ? "decreasing"
          : "stable",
    significant: pValue < SIGNIFICANCE_LEVEL,
  };
}

export function analyzeEnvironmentalTrend(
  observations,
  variableId,
  unit = "Not specified",
) {
  if (!Array.isArray(observations)) {
    throw new Error("Invalid environmental observations.");
  }

  if (!variableId || typeof variableId !== "string") {
    throw new Error("Please provide an environmental variable ID.");
  }

  const annualData = calculateAnnualAverages(
    observations,
    variableId,
  );

  const trend = calculateLinearRegression(annualData);

  return {
    variable: variableId,
    unit,
    annualData,
    trend: {
      direction: trend.direction,
      slopePerYear: trend.slope,
      totalChange: trend.totalChange,
      pValue: trend.pValue,
      significant: trend.significant,
      significanceLevel: SIGNIFICANCE_LEVEL,
      startYear: trend.startYear,
      endYear: trend.endYear,
      yearsAnalyzed: trend.yearsAnalyzed,
    },
  };
}

// Retained for any existing code that imports this function.
export function analyzeTemperatureTrend(
  observations,
  variableId,
) {
  return analyzeEnvironmentalTrend(
    observations,
    variableId,
    "°C",
  );
}

// Retained for compatibility with the old temperature analysis.
export function analyzeAllTemperatureTrends(observations) {
  const variables = ["T2M", "T2M_MAX", "T2M_MIN"];

  return variables.map((variableId) => {
    try {
      return {
        success: true,
        ...analyzeTemperatureTrend(observations, variableId),
      };
    } catch (error) {
      return {
        success: false,
        variable: variableId,
        error: error.message,
      };
    }
  });
}
