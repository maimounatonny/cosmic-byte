import { NextResponse } from "next/server";

import { getCountryTemperatureData } from "@/lib/nasa/power";

import { analyzeAllTemperatureTrends } from "@/lib/analysis/trendAnalysis";

// Countries currently supported by the investigation.
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
    aliases: ["united kingdom", "great britain", "britain", "uk", "u.k."],
  },
];

// Escape special characters before using an alias in a regex.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Identify the country mentioned in the research question.
function detectCountry(question) {
  if (!question || typeof question !== "string") {
    return null;
  }

  // Check longer aliases first to avoid shorter matches
  // interfering with full country names.
  const countries = SUPPORTED_COUNTRIES.map((country) => ({
    ...country,
    aliases: [...country.aliases].sort((a, b) => b.length - a.length),
  })).sort((a, b) => {
    const longestA = Math.max(...a.aliases.map((x) => x.length));
    const longestB = Math.max(...b.aliases.map((x) => x.length));
    return longestB - longestA;
  });

  for (const country of countries) {
    for (const alias of country.aliases) {
      const pattern = new RegExp(
        `(^|[^a-z])${escapeRegex(alias)}([^a-z]|$)`,
        "i",
      );

      if (pattern.test(question)) {
        return country.name;
      }
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    const startYear = Number(body.startYear || 1981);

    const endYear = Number(body.endYear || new Date().getFullYear());

    // Validate the study period.
    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < 1981 ||
      endYear < startYear ||
      endYear > new Date().getFullYear()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid study period.",
        },
        { status: 400 },
      );
    }

    // Allow an explicit country field, or identify it
    // from the submitted research question.
    const country =
      typeof body.country === "string" && body.country.trim()
        ? body.country.trim()
        : detectCountry(question);

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please mention a supported country in your research question: Qatar, India, Bangladesh, United States, or United Kingdom.",
        },
        { status: 400 },
      );
    }

    // Retrieve NASA POWER temperature measurements
    // for the selected country's five sample locations.
    const temperatureData = await getCountryTemperatureData({
      country,
      startYear,
      endYear,
    });

    if (!temperatureData.observations.length) {
      throw new Error(
        `NASA did not return temperature observations for ${temperatureData.location} during this period.`,
      );
    }

    // Calculate trends for all temperature variables.
    const analysisResults = analyzeAllTemperatureTrends(
      temperatureData.observations,
    );

    const successfulResults = analysisResults.filter(
      (result) => result.success,
    );

    if (successfulResults.length === 0) {
      throw new Error("Not enough temperature data to calculate a trend.");
    }

    return NextResponse.json({
      success: true,

      question:
        question ||
        `Temperature trend analysis for ${temperatureData.location}`,

      location: temperatureData.location,

      studyPeriod: {
        startYear,
        endYear,
      },

      dataSource: temperatureData.source,

      observationCount: temperatureData.observationCount,

      variablesAnalyzed: successfulResults.length,

      sampledLocations: temperatureData.sampledLocations,

      spatialMethod: temperatureData.spatialMethod,

      results: analysisResults,

      summary: {
        increasing: successfulResults.filter(
          (result) => result.trend.direction === "increasing",
        ).length,

        decreasing: successfulResults.filter(
          (result) => result.trend.direction === "decreasing",
        ).length,

        statisticallySignificant: successfulResults.filter(
          (result) => result.trend.significant,
        ).length,
      },
    });
  } catch (error) {
    console.error("Temperature analysis API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to complete temperature analysis.",
      },
      { status: 500 },
    );
  }
}
