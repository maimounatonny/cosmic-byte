
/**
 * NASA Dataset Catalogue
 *
 * This file stores the initial collection of environmental
 * datasets supported by Earth System Trend Detective.
 *
 * It is separate from the UI so it can be reused by:
 * - NASA dataset discovery
 * - Study configuration
 * - Data retrieval
 * - Statistical analysis
 *
 * Important:
 * Listing a dataset here does not guarantee that data is
 * available for a particular location or date.
 */

export const nasaDatasets = [
  {
    id: "modis-ndvi",

    name: "MODIS Vegetation Indices",

    product: {
      shortName: "MOD13Q1",
      version: "061",
      fullName: "MODIS/Terra Vegetation Indices 16-Day L3 Global 250m",
    },

    provider: "NASA LP DAAC",

    category: "vegetation",

    description:
      "Measures vegetation greenness and vegetation condition using satellite observations.",

    variables: [
      {
        id: "NDVI",
        name: "Normalized Difference Vegetation Index",
        description:
          "Measures vegetation greenness and is commonly used to monitor vegetation conditions.",
        units: "Dimensionless",
        resolution: "250 metres",
        temporalResolution: "16 days",
      },
      {
        id: "EVI",
        name: "Enhanced Vegetation Index",
        description:
          "Measures vegetation greenness with improved sensitivity in areas with dense vegetation.",
        units: "Dimensionless",
        resolution: "250 metres",
        temporalResolution: "16 days",
      },
    ],

    investigationTypes: ["trend", "relationship", "explanation"],

    suggestedUses: [
      "Vegetation changes over time",
      "Changes in vegetation greenness",
      "Vegetation and rainfall relationships",
      "Vegetation responses to environmental conditions",
    ],

    limitations: [
      "Clouds and atmospheric conditions can affect observations.",
      "The vegetation indices measure greenness, not directly biomass or plant health.",
      "The product uses 16-day composite observations.",
    ],

    availabilityCheckRequired: true,
  },

  {
    id: "modis-land-temperature",

    name: "MODIS Land Surface Temperature",

    product: {
      shortName: "MOD11A2",
      version: "061",
      fullName: "MODIS/Terra Land Surface Temperature and Emissivity 8-Day L3 Global 1km",
    },

    provider: "NASA LP DAAC",

    category: "temperature",

    description:
      "Measures the temperature of Earth's land surface using satellite observations.",

    variables: [
      {
        id: "LST_Day_1km",
        name: "Daytime Land Surface Temperature",
        description:
          "Estimates land surface temperature during daytime satellite observations.",
        units: "Kelvin",
        resolution: "1 kilometre",
        temporalResolution: "8 days",
      },
      {
        id: "LST_Night_1km",
        name: "Nighttime Land Surface Temperature",
        description:
          "Estimates land surface temperature during nighttime satellite observations.",
        units: "Kelvin",
        resolution: "1 kilometre",
        temporalResolution: "8 days",
      },
    ],

    investigationTypes: ["trend", "relationship", "explanation"],

    suggestedUses: [
      "Changes in land surface temperature",
      "Daytime and nighttime temperature comparisons",
      "Temperature and vegetation relationships",
      "Regional land surface warming patterns",
    ],

    limitations: [
      "Land surface temperature is not the same as air temperature.",
      "Cloud cover can affect the availability of observations.",
      "The product uses 8-day composite observations.",
    ],

    availabilityCheckRequired: true,
  },

  {
    id: "gpm-precipitation",

    name: "GPM IMERG Daily Precipitation",

    product: {
      shortName: "GPM_3IMERGDF",
      version: "07",
      fullName:
        "GPM IMERG Final Precipitation L3 1-Day 0.1 Degree V07",
    },

    provider: "NASA GES DISC",

    category: "precipitation",

    description:
      "Provides satellite-based estimates of daily precipitation across the globe.",

    variables: [
      {
        id: "daily-precipitation",
        name: "Daily Precipitation",
        description:
          "Represents the estimated daily mean precipitation rate.",
        units: "mm/day",
        resolution: "0.1 degrees (approximately 10 km)",
        temporalResolution: "Daily",
      },
    ],

    investigationTypes: ["trend", "relationship", "explanation"],

    suggestedUses: [
      "Changes in precipitation over time",
      "Rainfall variability",
      "Rainfall and vegetation relationships",
      "Regional precipitation patterns",
    ],

    limitations: [
      "Satellite precipitation is an estimate, not a direct ground measurement.",
      "Accuracy can vary with surface conditions and geographic location.",
      "Final Run data has a processing delay of approximately 3.5 months.",
    ],

    availabilityCheckRequired: true,
  },
];

/**
 * Return every dataset in the catalogue.
 */
export function getAllDatasets() {
  return nasaDatasets;
}

/**
 * Find a dataset using its internal ID.
 */
export function getDatasetById(datasetId) {
  return nasaDatasets.find(
    (dataset) => dataset.id === datasetId
  ) || null;
}

/**
 * Return datasets that support a selected investigation type.
 */
export function getDatasetsByInvestigationType(type) {
  return nasaDatasets.filter((dataset) =>
    dataset.investigationTypes.includes(type)
  );
}

/**
 * Find a variable inside a particular dataset.
 */
export function getDatasetVariable(datasetId, variableId) {
  const dataset = getDatasetById(datasetId);

  if (!dataset) {
    return null;
  }

  return dataset.variables.find(
    (variable) => variable.id === variableId
  ) || null;
}
