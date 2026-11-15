const NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

// Selected countries and their sample locations.
// These locations are representative samples, not a complete
// or area-weighted coverage of each country.

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

// Curated NASA POWER variables for the correlation explorer.
// T2M is retrieved alongside these variables because it is
// the reference variable for the correlation calculations.

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
    description:
      "Temperature at which air becomes saturated with water vapour.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "T2MWET",
    name: "Wet-Bulb Temperature",
    description:
      "Temperature accounting for the cooling effect of evaporation.",
    unit: "°C",
    category: "Temperature-related",
  },
  {
    id: "T2M_RANGE",
    name: "Daily Temperature Range",
    description:
      "Difference between daily maximum and minimum air temperature.",
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
    description: "Average wind speed at 10 metres above the surface.",
    unit: "m/s",
    category: "Wind",
  },
  {
    id: "WS50M",
    name: "Wind Speed at 50 Metres",
    description: "Average wind speed at 50 metres above the surface.",
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
    description: "Incoming shortwave solar radiation under all-sky conditions.",
    unit: "kWh/m²/day",
    category: "Solar radiation",
  },
  {
    id: "ALLSKY_SFC_LW_DWN",
    name: "Longwave Radiation",
    description: "Incoming longwave radiation under all-sky conditions.",
    unit: "W/m²",
    category: "Solar radiation",
  },
];

function normalizeCountry(country) {
  if (!country || typeof country !== "string") {
    throw new Error("Please provide a country name.");
  }

  const normalized = country.trim().toLowerCase();

  for (const [key, countryInfo] of Object.entries(COUNTRY_LOCATIONS)) {
    if (key === normalized || countryInfo.aliases.includes(normalized)) {
      return {
        key,
        ...countryInfo,
      };
    }
  }

  throw new Error(
    `Temperature analysis is currently available for: ${Object.values(
      COUNTRY_LOCATIONS,
    )
      .map((country) => country.name)
      .join(", ")}.`,
  );
}

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

async function fetchPointTemperatureData(point, startDate, endDate) {
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

  const response = await fetch(`${NASA_POWER_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(`NASA returned an invalid response for ${point.name}.`);
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
    throw new Error(`No temperature measurements returned for ${point.name}.`);
  }

  return {
    point: point.name,
    parameters: parameterData,
  };
}

// Retrieves the reference temperature and all selected related
// variables together for one sample location.
async function fetchPointRelatedData(point, startDate, endDate) {
  const parameterIds = [
    "T2M",
    ...RELATED_VARIABLES.map((variable) => variable.id),
  ];

  const params = new URLSearchParams({
    parameters: parameterIds.join(","),
    community: "RE",
    longitude: String(point.longitude),
    latitude: String(point.latitude),
    start: startDate,
    end: endDate,
    format: "JSON",
    "time-standard": "UTC",
  });

  const response = await fetch(`${NASA_POWER_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `NASA returned an invalid related-variable response for ${point.name}.`,
    );
  }

  if (!response.ok) {
    console.error(
      `NASA POWER related-variable error for ${point.name}:`,
      result,
    );

    throw new Error(
      `NASA POWER could not retrieve the related variables for ${point.name}: ${
        result?.messages ? JSON.stringify(result.messages) : response.status
      }`,
    );
  }

  const parameterData = result.properties?.parameter;

  if (!parameterData) {
    throw new Error(
      `No related-variable measurements returned for ${point.name}.`,
    );
  }

  return {
    point: point.name,
    parameters: parameterData,
  };
}

function getDateRange(startYear, endYear) {
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

  const actualEndDate = requestedEndDate > today ? today : requestedEndDate;

  return {
    startDate: `${startYear}0101`,
    endDate: formatDate(actualEndDate),
  };
}

export async function getCountryTemperatureData({
  country = "Qatar",
  startYear = 1981,
  endYear = new Date().getFullYear(),
} = {}) {
  const selectedCountry = normalizeCountry(country);
  const { startDate, endDate } = getDateRange(startYear, endYear);

  // Retrieve measurements for the five selected locations.
  const pointResults = await Promise.all(
    selectedCountry.points.map((point) =>
      fetchPointTemperatureData(point, startDate, endDate),
    ),
  );

  // Combine measurements from all sample locations by date.
  const dailyData = new Map();

  for (const pointResult of pointResults) {
    for (const variable of TEMPERATURE_VARIABLES) {
      const values = pointResult.parameters[variable.id];

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

        dailyData.get(date)[`${variable.id}_values`].push(value);
      }
    }
  }

  const observations = Array.from(dailyData.values())
    .map((day) => {
      const observation = {
        date: day.date,
      };

      for (const variable of TEMPERATURE_VARIABLES) {
        const values = day[`${variable.id}_values`];

        observation[variable.id] =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null;

        observation[`${variable.id}_pointCount`] = values.length;
      }

      return observation;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    location: selectedCountry.name,
    startDate,
    endDate,
    sampledLocations: selectedCountry.points,
    variables: TEMPERATURE_VARIABLES,
    observations,
    observationCount: observations.length,
    source: "NASA POWER",
    spatialMethod: `Average of available measurements from ${selectedCountry.points.length} sample locations`,
  };
}

// Retrieves T2M and the 12 related variables for the selected country.
export async function getCountryRelatedVariableData({
  country = "Qatar",
  startYear = 1981,
  endYear = new Date().getFullYear(),
} = {}) {
  const selectedCountry = normalizeCountry(country);
  const { startDate, endDate } = getDateRange(startYear, endYear);

  const pointResults = await Promise.all(
    selectedCountry.points.map((point) =>
      fetchPointRelatedData(point, startDate, endDate),
    ),
  );

  const allVariableIds = [
    "T2M",
    ...RELATED_VARIABLES.map((variable) => variable.id),
  ];

  const dailyData = new Map();

  for (const pointResult of pointResults) {
    for (const variableId of allVariableIds) {
      const values = pointResult.parameters[variableId];

      if (!values) continue;

      for (const [date, rawValue] of Object.entries(values)) {
        const value = getValidValue(rawValue);

        if (value === null) continue;

        if (!dailyData.has(date)) {
          const initialDay = { date };

          for (const id of allVariableIds) {
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

      for (const variableId of allVariableIds) {
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
    referenceVariable: {
      id: "T2M",
      name: "Average Air Temperature",
      unit: "°C",
    },
    variables: RELATED_VARIABLES,
    observations,
    observationCount: observations.length,
    source: "NASA POWER",
    spatialMethod: `Average of available measurements from ${selectedCountry.points.length} sample locations`,
  };
}

// Keep the original function available for existing Qatar code.
export async function getQatarTemperatureData({
  startYear = 1981,
  endYear = new Date().getFullYear(),
} = {}) {
  return getCountryTemperatureData({
    country: "Qatar",
    startYear,
    endYear,
  });
}
