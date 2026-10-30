const NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

const MIN_YEAR = 1981;
const MAX_YEAR = 2024;

const COUNTRY_LOCATIONS = {
  qatar: {
    name: "Qatar",
    aliases: ["qatar"],
    points: [
      { name: "Doha", latitude: 25.2854, longitude: 51.531 },
      { name: "Al Khor", latitude: 25.6804, longitude: 51.4969 },
      { name: "Dukhan", latitude: 25.4249, longitude: 50.7823 },
      { name: "Mesaieed", latitude: 24.9927, longitude: 51.55 },
      { name: "Abu Samra", latitude: 24.74, longitude: 50.84 },
    ],
  },
  india: {
    name: "India",
    aliases: ["india"],
    points: [
      { name: "New Delhi", latitude: 28.6139, longitude: 77.209 },
      { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
      { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
      { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
      { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
    ],
  },
  bangladesh: {
    name: "Bangladesh",
    aliases: ["bangladesh"],
    points: [
      { name: "Dhaka", latitude: 23.8103, longitude: 90.4125 },
      { name: "Chattogram", latitude: 22.3569, longitude: 91.7832 },
      { name: "Rajshahi", latitude: 24.3745, longitude: 88.6042 },
      { name: "Khulna", latitude: 22.8456, longitude: 89.5403 },
      { name: "Sylhet", latitude: 24.8949, longitude: 91.8687 },
    ],
  },
  "united states": {
    name: "United States",
    aliases: ["united states", "usa", "us", "u.s.a.", "u.s."],
    points: [
      { name: "New York", latitude: 40.7128, longitude: -74.006 },
      { name: "Chicago", latitude: 41.8781, longitude: -87.6298 },
      { name: "Denver", latitude: 39.7392, longitude: -104.9903 },
      { name: "Dallas", latitude: 32.7767, longitude: -96.797 },
      { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437 },
    ],
  },
  "united kingdom": {
    name: "United Kingdom",
    aliases: ["united kingdom", "uk", "u.k.", "britain", "great britain"],
    points: [
      { name: "London", latitude: 51.5072, longitude: -0.1276 },
      { name: "Manchester", latitude: 53.4808, longitude: -2.2426 },
      { name: "Birmingham", latitude: 52.4862, longitude: -1.8904 },
      { name: "Edinburgh", latitude: 55.9533, longitude: -3.1883 },
      { name: "Cardiff", latitude: 51.4816, longitude: -3.1791 },
    ],
  },
};

export const ENVIRONMENTAL_VARIABLES = [
  {
    id: "T2M",
    name: "Average Air Temperature",
    unit: "°C",
    description: "Daily average air temperature at 2 metres.",
    category: "Temperature",
  },
  {
    id: "T2M_MAX",
    name: "Maximum Air Temperature",
    unit: "°C",
    description: "Daily maximum air temperature at 2 metres.",
    category: "Temperature",
  },
  {
    id: "T2M_MIN",
    name: "Minimum Air Temperature",
    unit: "°C",
    description: "Daily minimum air temperature at 2 metres.",
    category: "Temperature",
  },
  {
    id: "PRECTOTCORR",
    name: "Corrected Precipitation",
    unit: "mm/day",
    description: "Daily corrected precipitation.",
    category: "Water and moisture",
  },
  {
    id: "RH2M",
    name: "Relative Humidity",
    unit: "%",
    description: "Relative humidity at 2 metres.",
    category: "Water and moisture",
  },
  {
    id: "T2MDEW",
    name: "Dew Point Temperature",
    unit: "°C",
    description: "Temperature at which air becomes saturated.",
    category: "Temperature-related",
  },
  {
    id: "ALLSKY_SFC_SW_DWN",
    name: "Solar Radiation",
    unit: "kWh/m²/day",
    description: "Incoming shortwave solar radiation under all-sky conditions.",
    category: "Solar radiation",
  },
  {
    id: "WS10M",
    name: "Wind Speed at 10 Metres",
    unit: "m/s",
    description: "Average wind speed at 10 metres above the surface.",
    category: "Wind",
  },
  {
    id: "QV2M",
    name: "Specific Humidity",
    unit: "g/kg",
    description: "Amount of water vapour in the air.",
    category: "Water and moisture",
  },
  {
    id: "TS",
    name: "Earth Skin Temperature",
    unit: "°C",
    description: "Temperature of the Earth's surface.",
    category: "Temperature-related",
  },
];

// Retained for compatibility with the existing correlation explorer/API.
export const RELATED_VARIABLES = [
  {
    id: "PRECTOTCORR",
    name: "Precipitation",
    description: "Daily corrected precipitation.",
    unit: "mm/day",
    category: "Water and moisture",
  },
  {
    id: "RH2M",
    name: "Relative Humidity",
    description: "Relative humidity at 2 metres.",
    unit: "%",
    category: "Water and moisture",
  },
  {
    id: "QV2M",
    name: "Specific Humidity",
    description: "Amount of water vapour in the air.",
    unit: "g/kg",
    category: "Water and moisture",
  },
  {
    id: "T2MDEW",
    name: "Dew Point Temperature",
    description: "Temperature at which air becomes saturated.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "T2MWET",
    name: "Wet-Bulb Temperature",
    description: "Temperature accounting for evaporative cooling.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "T2M_RANGE",
    name: "Daily Temperature Range",
    description: "Difference between daily maximum and minimum temperature.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "TS",
    name: "Earth Skin Temperature",
    description: "Temperature of the Earth's surface.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "WS10M",
    name: "Wind Speed at 10 Metres",
    description: "Average wind speed at 10 metres.",
    unit: "m/s",
    category: "Wind",
  },
  {
    id: "WS50M",
    name: "Wind Speed at 50 Metres",
    description: "Average wind speed at 50 metres.",
    unit: "m/s",
    category: "Wind",
  },
  {
    id: "PS",
    name: "Surface Pressure",
    description: "Atmospheric pressure at the Earth's surface.",
    unit: "kPa",
    category: "Atmosphere",
  },
  {
    id: "ALLSKY_SFC_SW_DWN",
    name: "Shortwave Solar Radiation",
    description: "Incoming shortwave solar radiation.",
    unit: "kWh/m²/day",
    category: "Solar radiation",
  },
  {
    id: "ALLSKY_SFC_LW_DWN",
    name: "Longwave Radiation",
    description: "Incoming longwave radiation.",
    unit: "W/m²",
    category: "Solar radiation",
  },
];

const LEGACY_VARIABLE_INFO = {
  T2M: ENVIRONMENTAL_VARIABLES.find((item) => item.id === "T2M"),
  ...Object.fromEntries(RELATED_VARIABLES.map((item) => [item.id, item])),
};

export function getVariableInfo(variableId) {
  return (
    ENVIRONMENTAL_VARIABLES.find((item) => item.id === variableId) ||
    LEGACY_VARIABLE_INFO[variableId] ||
    null
  );
}

function normalizeCountry(country) {
  if (!country || typeof country !== "string") {
    throw new Error("Please provide a country name.");
  }

  const normalized = country.trim().toLowerCase();

  for (const [key, countryInfo] of Object.entries(COUNTRY_LOCATIONS)) {
    if (key === normalized || countryInfo.aliases.includes(normalized)) {
      return { key, ...countryInfo };
    }
  }

  throw new Error(
    `This country is not supported. Available countries: ${Object.values(
      COUNTRY_LOCATIONS,
    )
      .map((item) => item.name)
      .join(", ")}.`,
  );
}

function getDateRange(startYear, endYear) {
  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < MIN_YEAR ||
    endYear > MAX_YEAR ||
    endYear < startYear ||
    endYear - startYear + 1 < 10
  ) {
    throw new Error(
      `Please select a study period between ${MIN_YEAR} and ${MAX_YEAR} containing at least 10 years.`,
    );
  }

  return {
    startDate: `${startYear}0101`,
    endDate: `${endYear}1231`,
  };
}

function getValidValue(value) {
  if (value === null || value === undefined) return null;

  const number = Number(value);

  if (!Number.isFinite(number) || number === -999) {
    return null;
  }

  return number;
}

async function fetchPointData(point, variableIds, startDate, endDate) {
  const params = new URLSearchParams({
    parameters: variableIds.join(","),
    community: "RE",
    longitude: String(point.longitude),
    latitude: String(point.latitude),
    start: startDate,
    end: endDate,
    format: "JSON",
    "time-standard": "UTC",
  });

  const response = await fetch(`${NASA_POWER_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `NASA POWER returned an invalid response for ${point.name}.`,
    );
  }

  if (!response.ok) {
    console.error(`NASA POWER error for ${point.name}:`, result);

    throw new Error(
      `NASA POWER request failed for ${point.name}: ${
        result?.messages ? JSON.stringify(result.messages) : response.status
      }`,
    );
  }

  const parameterData = result.properties?.parameter;

  if (!parameterData) {
    throw new Error(`No measurements were returned for ${point.name}.`);
  }

  const missingVariables = variableIds.filter((id) => !parameterData[id]);

  if (missingVariables.length > 0) {
    throw new Error(
      `NASA POWER did not return these requested parameters for ${point.name}: ${missingVariables.join(", ")}.`,
    );
  }

  return {
    point: point.name,
    parameters: parameterData,
  };
}

/**
 * Retrieves selected NASA POWER daily variables for the five
 * representative locations of a country.
 *
 * Each date is averaged across the available sample locations.
 */
export async function getCountryEnvironmentalData({
  country = "Qatar",
  variableIds = ["T2M"],
  startYear = 1981,
  endYear = 2024,
} = {}) {
  const selectedCountry = normalizeCountry(country);
  const { startDate, endDate } = getDateRange(startYear, endYear);

  if (!Array.isArray(variableIds) || variableIds.length === 0) {
    throw new Error("Please select at least one environmental variable.");
  }

  const uniqueVariableIds = [...new Set(variableIds)];

  const unsupportedVariables = uniqueVariableIds.filter(
    (id) => !getVariableInfo(id),
  );

  if (unsupportedVariables.length > 0) {
    throw new Error(
      `Unsupported NASA variables: ${unsupportedVariables.join(", ")}`,
    );
  }

  const pointResults = await Promise.all(
    selectedCountry.points.map((point) =>
      fetchPointData(point, uniqueVariableIds, startDate, endDate),
    ),
  );

  const dailyData = new Map();

  for (const pointResult of pointResults) {
    for (const variableId of uniqueVariableIds) {
      const values = pointResult.parameters[variableId];

      for (const [date, rawValue] of Object.entries(values || {})) {
        const value = getValidValue(rawValue);

        if (value === null) continue;

        if (!dailyData.has(date)) {
          const initialDay = { date };

          for (const id of uniqueVariableIds) {
            initialDay[`${id}_values`] = [];
          }

          dailyData.set(date, initialDay);
        }

        dailyData.get(date)[`${variableId}_values`].push(value);
      }
    }
  }

  const observations = Array.from(dailyData.values())
    .map((day) => {
      const observation = { date: day.date };

      for (const variableId of uniqueVariableIds) {
        const values = day[`${variableId}_values`];

        observation[variableId] =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null;

        observation[`${variableId}_pointCount`] = values.length;
      }

      return observation;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    location: selectedCountry.name,
    startDate,
    endDate,
    sampledLocations: selectedCountry.points,
    variables: uniqueVariableIds.map(getVariableInfo),
    observations,
    observationCount: observations.length,
    source: "NASA POWER",
    spatialMethod: `Average of available measurements from ${selectedCountry.points.length} sample locations`,
  };
}

// Backwards-compatible temperature retrieval.
export async function getCountryTemperatureData({
  country = "Qatar",
  startYear = 1981,
  endYear = 2024,
} = {}) {
  return getCountryEnvironmentalData({
    country,
    variableIds: ["T2M", "T2M_MAX", "T2M_MIN"],
    startYear,
    endYear,
  });
}

// Backwards-compatible related-variable retrieval.
export async function getCountryRelatedVariableData({
  country = "Qatar",
  startYear = 1981,
  endYear = 2024,
} = {}) {
  const variableIds = ["T2M", ...RELATED_VARIABLES.map((item) => item.id)];

  const data = await getCountryEnvironmentalData({
    country,
    variableIds,
    startYear,
    endYear,
  });

  return {
    ...data,
    referenceVariable: getVariableInfo("T2M"),
    variables: RELATED_VARIABLES,
  };
}

export async function getQatarTemperatureData({
  startYear = 1981,
  endYear = 2024,
} = {}) {
  return getCountryTemperatureData({
    country: "Qatar",
    startYear,
    endYear,
  });
}
