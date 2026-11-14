
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId || !/^[a-f0-9-]{36}$/i.test(taskId)) {
      return Response.json(
        {
          success: false,
          message: "A valid NASA task ID is required.",
        },
        { status: 400 }
      );
    }

    const token = await getNasaToken();

    const nasaResponse = await fetch(
      `${NASA_API_URL}task/${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const nasaData = await nasaResponse.json();

    if (!nasaResponse.ok) {
      console.error("NASA status request failed:", nasaData);

      return Response.json(
        {
          success: false,
          message: "Could not retrieve NASA task status.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      taskId,
      task: nasaData,
    });
  } catch (error) {
    console.error("NASA status error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Could not check NASA task status.",
      },
      { status: 500 }
    );
  }
}
