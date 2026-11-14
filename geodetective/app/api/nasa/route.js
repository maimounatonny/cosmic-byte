
const NASA_API_URL = "https://appeears.earthdatacloud.nasa.gov/api/";

export async function GET() {
  try {
    const username = process.env.NASA_EARTHDATA_USERNAME;
    const password = process.env.NASA_EARTHDATA_PASSWORD;

    if (!username || !password) {
      return Response.json(
        {
          success: false,
          message: "NASA credentials are missing from .env.local.",
        },
        { status: 500 }
      );
    }

    const credentials = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const nasaResponse = await fetch(
      `${NASA_API_URL}login`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
      }
    );

    const nasaData = await nasaResponse.json();

    if (!nasaResponse.ok || !nasaData.token) {
      console.error(
        "NASA authentication failed:",
        nasaResponse.status,
        nasaData
      );

      return Response.json(
        {
          success: false,
          message:
            "NASA authentication failed. Check your Earthdata credentials and API access.",
        },
        { status: 502 }
      );
    }

    // Never send the NASA access token to the browser.
    return Response.json({
      success: true,
      message: "Successfully connected to NASA AppEEARS.",
    });
  } catch (error) {
    console.error("NASA connection error:", error);

    return Response.json(
      {
        success: false,
        message: "Could not connect to NASA AppEEARS.",
      },
      { status: 500 }
    );
  }
}
