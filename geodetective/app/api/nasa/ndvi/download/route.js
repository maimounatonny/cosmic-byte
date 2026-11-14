
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

    // Verify that the task has completed.
    const statusResponse = await fetch(
      `${NASA_API_URL}task/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      return Response.json(
        {
          success: false,
          message: "Could not check NASA task status.",
        },
        { status: 502 }
      );
    }

    if (statusData.status !== "done") {
      return Response.json(
        {
          success: false,
          status: statusData.status,
          message: "NASA has not finished processing this task.",
        },
        { status: 202 }
      );
    }

    // Retrieve the task's file bundle.
    const bundleResponse = await fetch(
      `${NASA_API_URL}bundle/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const bundleData = await bundleResponse.json();

    if (!bundleResponse.ok) {
      return Response.json(
        {
          success: false,
          message: "Could not retrieve NASA files.",
        },
        { status: 502 }
      );
    }

    // Find the actual CSV results file.
    const csvFile = (bundleData.files || []).find(
      (file) =>
        file.file_type?.toLowerCase() === "csv" ||
        file.file_name?.toLowerCase().endsWith(".csv")
    );

    if (!csvFile) {
      return Response.json(
        {
          success: false,
          message: "No CSV results file was found.",
        },
        { status: 404 }
      );
    }

    // Download the CSV from NASA.
    const csvResponse = await fetch(
      `${NASA_API_URL}bundle/${taskId}/${csvFile.file_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!csvResponse.ok) {
      return Response.json(
        {
          success: false,
          message: "Could not download the NASA CSV file.",
        },
        { status: 502 }
      );
    }

    const csvContent = await csvResponse.text();

    return Response.json({
      success: true,
      taskId,
      fileName: csvFile.file_name,
      fileSize: csvFile.file_size,
      csvContent,
    });
  } catch (error) {
    console.error("NASA CSV download error:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Could not download NASA results.",
      },
      { status: 500 }
    );
  }
}
