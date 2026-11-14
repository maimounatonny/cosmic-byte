
import { NextResponse } from "next/server";
import {
  getDatasetsByInvestigationType,
} from "../../../../lib/nasa/datasetCatalog";

const CMR_BASE_URL =
  "https://cmr.earthdata.nasa.gov/search/collections.umm_json";

async function verifyDataset(dataset) {
  const params = new URLSearchParams({
    short_name: dataset.product.shortName,
    version: dataset.product.version,
    page_size: "5",
  });

  try {
    const response = await fetch(
      `${CMR_BASE_URL}?${params.toString()}`,
      {
        headers: {
          Accept: "application/vnd.nasa.cmr.umm_results+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `NASA CMR returned status ${response.status}`
      );
    }

    const result = await response.json();

    const matchingItem = result.items?.find((item) => {
      const metadata = item.umm || {};

      return (
        metadata.ShortName?.toLowerCase() ===
          dataset.product.shortName.toLowerCase() &&
        String(metadata.Version) === dataset.product.version
      );
    });

    if (!matchingItem) {
      return {
        ...dataset,
        verified: false,
        availabilityStatus: "not_found",
        message:
          "This product was not found in the NASA metadata search.",
      };
    }

    const metadata = matchingItem.umm || {};

    return {
      ...dataset,
      verified: true,
      availabilityStatus: "metadata_confirmed",
      nasaMetadata: {
        conceptId: matchingItem.meta?.conceptId || null,
        title: metadata.EntryTitle || dataset.product.fullName,
        shortName: metadata.ShortName || dataset.product.shortName,
        version: metadata.Version || dataset.product.version,
        provider: metadata.DataCenters?.[0]?.ShortName || null,
      },
      message:
        "The dataset collection was found in NASA CMR metadata.",
    };
  } catch (error) {
    console.error(
      `NASA metadata search failed for ${dataset.id}:`,
      error
    );

    return {
      ...dataset,
      verified: false,
      availabilityStatus: "search_error",
      message: "NASA metadata could not be checked.",
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { type, question } = body;

    if (!type || !question || !question.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Investigation type and question are required.",
        },
        { status: 400 }
      );
    }

    const supportedTypes = [
      "trend",
      "relationship",
      "explanation",
    ];

    if (!supportedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid investigation type.",
        },
        { status: 400 }
      );
    }

    // Retrieve datasets based on the type selected by the user.
    // No automatic question classification is performed.
    const candidateDatasets =
      getDatasetsByInvestigationType(type);

    // Verify each candidate against NASA CMR metadata.
    const verifiedDatasets = await Promise.all(
      candidateDatasets.map(verifyDataset)
    );

    const confirmedCount = verifiedDatasets.filter(
      (dataset) => dataset.verified
    ).length;

    return NextResponse.json({
      success: true,

      investigation: {
        type,
        question: question.trim(),
      },

      summary: {
        candidatesChecked: candidateDatasets.length,
        metadataConfirmed: confirmedCount,
      },

      datasets: verifiedDatasets,
    });
  } catch (error) {
    console.error("NASA discovery API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete NASA dataset discovery.",
      },
      { status: 500 }
    );
  }
}
