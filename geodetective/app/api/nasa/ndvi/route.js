
const NASA_API_URL =
  "https://appeears.earthdatacloud.nasa.gov/api/";

async function getNasaToken() {
  const username = process.env.NASA_EARTHDATA_USERNAME;
  const password = process.env.NASA_EARTHDATA_PASSWORD;

  if (!username || !password) {
    throw new Error("NASA credentials are missing.");
  }

  const credentials = Buffer.from(
    `${username}:${password}`
  ).toString("base64");

  const response = await fetch(`${NASA_API_URL}login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data.token) {
    throw new Error("NASA authentication failed.");
  }

  return data.token;
}

function toNasaDate(date) {
  const [year, month, day] = date.split("-");
  return `${month}-${day}-${year}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { latitude, longitude, startDate, endDate } = body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return Response.json(
        {
          success: false,
          message: "Valid latitude and longitude are required.",
        },
        { status: 400 }
      );
    }

    const validDate = (value) =>
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

    if (
      !validDate(startDate) ||
      !validDate(endDate) ||
      startDate > endDate ||
      endDate > new Date().toISOString().slice(0, 10)
    ) {
      return Response.json(
        {
          success: false,
          message: "Provide a valid date range that is not in the future.",
        },
        { status: 400 }
      );
    }

    const token = await getNasaToken();

    const task = {
      task_type: "point",
      task_name: `geoDetective_NDVI_${Date.now()}`,
      params: {
        dates: [
          {
            startDate: toNasaDate(startDate),
            endDate: toNasaDate(endDate),
          },
        ],
        layers: [
          {
            product: "MOD13Q1.061",
            layer: "_250m_16_days_NDVI",
          },
          {
            product: "MOD13Q1.061",
            layer: "_250m_16_days_VI_Quality",
          },
        ],
        coordinates: [
          {
            id: "investigation_location",
            latitude,
            longitude,
          },
        ],
      },
    };

    const nasaResponse = await fetch(`${NASA_API_URL}task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
      cache: "no-store",
    });

    const nasaData = await nasaResponse.json();

    if (!nasaResponse.ok || !nasaData.task_id) {
      console.error("NASA task submission failed:", nasaData);

      return Response.json(
        {
          success: false,
          message: "NASA could not submit the vegetation analysis request.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      message: "NDVI analysis request submitted to NASA.",
      taskId: nasaData.task_id,
      dataset: "MOD13Q1.061",
      coordinates: {
        latitude,
        longitude,
      },
      dates: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("NDVI API error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Could not submit NDVI request.",
      },
      { status: 500 }
    );
  }
}
