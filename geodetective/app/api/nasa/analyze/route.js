
import { NextResponse } from "next/server";

import {
  getQatarTemperatureData,
} from "@/lib/nasa/power";

import {
  analyzeAllTemperatureTrends,
} from "@/lib/analysis/trendAnalysis";

export async function POST(request) {
  try {
    const body = await request.json();

    const startYear = Number(body.startYear || 1981);
    const endYear = Number(
      body.endYear || new Date().getFullYear()
    );

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
        { status: 400 }
      );
    }

    // Retrieve NASA temperature measurements
    const temperatureData =
      await getQatarTemperatureData({
        startYear,
        endYear,
      });

    if (!temperatureData.observations.length) {
      throw new Error(
        "NASA did not return temperature observations for this period."
      );
    }

    // Calculate trends for all temperature variables
    const analysisResults =
      analyzeAllTemperatureTrends(
        temperatureData.observations
      );

    const successfulResults = analysisResults.filter(
      (result) => result.success
    );

    if (successfulResults.length === 0) {
      throw new Error(
        "Not enough temperature data to calculate a trend."
      );
    }

    return NextResponse.json({
      success: true,

      question: "Is Qatar getting hotter?",

      location: temperatureData.location,

      studyPeriod: {
        startYear,
        endYear,
      },

      dataSource: temperatureData.source,

      observationCount:
        temperatureData.observationCount,

      variablesAnalyzed: successfulResults.length,

      results: analysisResults,

      summary: {
        increasing: successfulResults.filter(
          (result) =>
            result.trend.direction === "increasing"
        ).length,

        decreasing: successfulResults.filter(
          (result) =>
            result.trend.direction === "decreasing"
        ).length,

        statisticallySignificant:
          successfulResults.filter(
            (result) => result.trend.significant
          ).length,
      },
    });
  } catch (error) {
    console.error(
      "Temperature analysis API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to complete temperature analysis.",
      },
      { status: 500 }
    );
  }
}
