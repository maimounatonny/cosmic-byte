
import { NextResponse } from "next/server";
import {
  getCountryEnvironmentalData,
  getVariableInfo,
} from "@/lib/nasa/power";
import { analyzeEnvironmentalTrend } from "@/lib/analysis/trendAnalysis";

const MIN_YEAR = 1981;
const MAX_YEAR = 2024;

export async function POST(request) {
  try {
    const body = await request.json();

    const country = body.country || "Qatar";
    const variable = body.variable;
    const startYear = Number(body.startYear);
    const endYear = Number(body.endYear);

    if (!variable || !getVariableInfo(variable)) {
      return NextResponse.json(
        { error: "Please select a supported environmental variable." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      startYear < MIN_YEAR ||
      endYear > MAX_YEAR ||
      endYear < startYear ||
      endYear - startYear + 1 < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid study period between 1981 and 2024 containing at least 10 years.",
        },
        { status: 400 },
      );
    }

    const variableInfo = getVariableInfo(variable);

    const nasaData = await getCountryEnvironmentalData({
      country,
      variableIds: [variable],
      startYear,
      endYear,
    });

    const trendResult = analyzeEnvironmentalTrend(
      nasaData.observations,
      variable,
      variableInfo.unit,
    );

    const results = [
      {
        success: true,
        ...trendResult,
      },
    ];

    return NextResponse.json({
      success: true,
      type: "trend",
      location: nasaData.location,
      studyPeriod: {
        startYear,
        endYear,
      },
      dataSource: nasaData.source,
      observationCount: nasaData.observationCount,
      variablesAnalyzed: 1,
      sampledLocations: nasaData.sampledLocations,
      spatialMethod: nasaData.spatialMethod,
      methodology: {
        aggregation: "Annual averages of daily measurements.",
        trend:
          "Ordinary least-squares linear regression applied to annual averages.",
        significance:
          "Two-sided t-test for the regression slope, using a significance level of 0.05.",
        minimumAnnualObservations: 10,
      },
      results,
      summary: {
        increasing:
          results.filter(
            (item) => item.trend.direction === "increasing",
          ).length,
        decreasing:
          results.filter(
            (item) => item.trend.direction === "decreasing",
          ).length,
        significant:
          results.filter(
            (item) => item.trend.significant,
          ).length,
      },
    });
  } catch (error) {
    console.error("NASA trend analysis API error:", error);

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
