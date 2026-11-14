
const NASA_POWER_URL =
  "https://power.larc.nasa.gov/api/temporal/daily/point";

const QATAR_POINTS = [
  { name: "Doha", latitude: 25.2854, longitude: 51.5310 },
  { name: "Al Khor", latitude: 25.6804, longitude: 51.4969 },
  { name: "Dukhan", latitude: 25.4249, longitude: 50.7823 },
  { name: "Mesaieed", latitude: 24.9927, longitude: 51.5500 },
  { name: "Abu Samra", latitude: 24.7400, longitude: 50.8400 },
];

const TEMPERATURE_VARIABLES = [
  {
    id: "T2M",
    name: "Average Air Temperature",
    unit: "°C",
  },
  {
    id: "T2M_MAX",
    name: "Maximum Air Temperature",
    unit: "°C",
  },
  {
    id: "T2M_MIN",
    name: "Minimum Air Temperature",
    unit: "°C",
  },
];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getValidValue(value) {
  const number = Number(value);

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(number) ||
    number === -999
  ) {
    return null;
  }

  return number;
}

async function fetchPointTemperatureData(
  point,
  startDate,
  endDate
) {
  const params = new URLSearchParams({
    parameters: "T2M,T2M_MAX,T2M_MIN",
    community: "RE",
    longitude: String(point.longitude),
    latitude: String(point.latitude),
    start: startDate,
    end: endDate,
    format: "JSON",
    "time-standard": "UTC",
  });

  const response = await fetch(
    `${NASA_POWER_URL}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `NASA returned an invalid response for ${point.name}.`
    );
  }

  if (!response.ok) {
    console.error(
      `NASA POWER error for ${point.name}:`,
      result
    );

    throw new Error(
      `NASA POWER request failed for ${point.name}: ${
        result?.messages
          ? JSON.stringify(result.messages)
          : response.status
      }`
    );
  }

  const parameterData =
    result.properties?.parameter;

  if (!parameterData) {
    throw new Error(
      `No temperature measurements returned for ${point.name}.`
    );
  }

  return {
    point: point.name,
    parameters: parameterData,
  };
}

export async function getQatarTemperatureData({
  startYear = 1981,
  endYear = new Date().getFullYear(),
} = {}) {
  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < 1981 ||
    endYear < startYear
  ) {
    throw new Error("Invalid temperature analysis date range.");
  }

  const today = new Date();

  const requestedEndDate = new Date(endYear, 11, 31);

  const actualEndDate =
    requestedEndDate > today ? today : requestedEndDate;

  const startDate = `${startYear}0101`;
  const endDate = formatDate(actualEndDate);

  // NASA recommends limiting concurrent requests.
  const pointResults = await Promise.all(
    QATAR_POINTS.map((point) =>
      fetchPointTemperatureData(
        point,
        startDate,
        endDate
      )
    )
  );

  const dailyData = new Map();

  for (const pointResult of pointResults) {
    for (const variable of TEMPERATURE_VARIABLES) {
      const values =
        pointResult.parameters[variable.id];

      if (!values) continue;

      for (const [date, rawValue] of Object.entries(values)) {
        const value = getValidValue(rawValue);

        if (value === null) continue;

        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date,
            T2M_values: [],
            T2M_MAX_values: [],
            T2M_MIN_values: [],
          });
        }

        dailyData
          .get(date)[`${variable.id}_values`]
          .push(value);
      }
    }
  }

  const observations = Array.from(dailyData.values())
    .map((day) => {
      const observation = {
        date: day.date,
      };

      for (const variable of TEMPERATURE_VARIABLES) {
        const values =
          day[`${variable.id}_values`];

        observation[variable.id] =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) /
              values.length
            : null;

        observation[`${variable.id}_pointCount`] =
          values.length;
      }

      return observation;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    location: "Qatar",
    startDate,
    endDate,
    sampledLocations: QATAR_POINTS,
    variables: TEMPERATURE_VARIABLES,
    observations,
    observationCount: observations.length,
    source: "NASA POWER",
    spatialMethod:
      "Average of available measurements from five sample locations",
  };
}
