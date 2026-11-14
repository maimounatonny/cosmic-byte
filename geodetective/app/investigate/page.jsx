
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./page.css";

const SatelliteMap = dynamic(
  () => import("./SatelliteMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "290px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#69d5ff",
        }}
      >
        Loading satellite map...
      </div>
    ),
  }
);

const DEFAULT_START_DATE = "2026-09-01";
const DEFAULT_END_DATE = "2026-10-31";

const NDVI_COLUMN =
  "MOD13Q1_061__250m_16_days_NDVI";

const QUALITY_COLUMN =
  "MOD13Q1_061__250m_16_days_VI_Quality_MODLAND_Description";

const USEFULNESS_COLUMN =
  "MOD13Q1_061__250m_16_days_VI_Quality_VI_Usefulness_Description";

// Parse CSV while supporting quoted values and commas.
function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("The NASA CSV file contains no observations.");
  }

  const parseRow = (line) => {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const character = line[i];

      if (character === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === "," && !insideQuotes) {
        values.push(current);
        current = "";
      } else {
        current += character;
      }
    }

    values.push(current);
    return values;
  };

  const headers = parseRow(lines[0]);

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = parseRow(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

function calculateNDVI(csvText) {
  const rows = parseCSV(csvText);

  const observations = rows
    .map((row) => ({
      date: row.Date,
      ndvi: Number(row[NDVI_COLUMN]),
      quality: row[QUALITY_COLUMN] || "Not provided",
      usefulness: row[USEFULNESS_COLUMN] || "Not provided",
    }))
    .filter(
      (item) =>
        item.date &&
        Number.isFinite(item.ndvi) &&
        item.ndvi >= -1 &&
        item.ndvi <= 1
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (observations.length === 0) {
    throw new Error("No valid NDVI measurements were found in the NASA results.");
  }

  const values = observations.map((item) => item.ndvi);

  const average =
    values.reduce((total, value) => total + value, 0) /
    values.length;

  const highest = observations.reduce((a, b) =>
    a.ndvi > b.ndvi ? a : b
  );

  const lowest = observations.reduce((a, b) =>
    a.ndvi < b.ndvi ? a : b
  );

  const first = observations[0];
  const last = observations[observations.length - 1];

  return {
    observations,
    average,
    highest,
    lowest,
    first,
    last,
    change: last.ndvi - first.ndvi,
  };
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getInterpretation(results) {
  const change = results.change;
  const absoluteChange = Math.abs(change);

  if (absoluteChange < 0.01) {
    return {
      title: "Relatively stable NDVI",
      description:
        "The NDVI measurements show only a small difference between the first and last observations. This suggests relatively stable vegetation-index values at the sampled point during this period.",
    };
  }

  if (change < 0) {
    return {
      title: "NDVI decreased",
      description:
        "The final observation has a lower NDVI value than the first observation. This indicates a decrease in the vegetation index at the sampled point. It does not, by itself, establish deforestation or identify the cause of the change.",
    };
  }

  return {
    title: "NDVI increased",
    description:
      "The final observation has a higher NDVI value than the first observation. This indicates an increase in the vegetation index at the sampled point. It does not, by itself, establish the cause of the change.",
  };
}

export default function Investigate() {
  const [category, setCategory] = useState("Land Changes");
  const [message, setMessage] = useState("");

  const [allLocations, setAllLocations] = useState([]);
  const [locationResults, setLocationResults] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocations, setShowLocations] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationResults, setInvestigationResults] = useState(null);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await fetch("/cities500.json");

        if (!response.ok) {
          throw new Error("Failed to load locations");
        }

        const data = await response.json();
        setAllLocations(data);
      } catch (error) {
        console.error("Error loading locations:", error);
        setMessage("Unable to load locations.");
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  // Search locations
  useEffect(() => {
    if (locationInput.trim().length < 2) {
      setLocationResults([]);
      return;
    }

    const search = locationInput.toLowerCase().trim();

    const results = allLocations
      .filter((item) => {
        return (
          item.name?.toLowerCase().includes(search) ||
          item.admin1?.toLowerCase().includes(search) ||
          item.admin2?.toLowerCase().includes(search) ||
          item.country?.toLowerCase().includes(search)
        );
      })
      .slice(0, 10);

    setLocationResults(results);
  }, [locationInput, allLocations]);

  // Select location
  const handleLocationSelect = (item) => {
    const label = [
      item.name,
      item.admin1,
      item.country,
    ]
      .filter(Boolean)
      .join(", ");

    setSelectedLocation({
      label,
      coordinates: [
        Number(item.lon),
        Number(item.lat),
      ],
    });

    setLocationInput(label);
    setShowLocations(false);
    setMessage("");
    setInvestigationResults(null);
  };

  // Wait between NASA task status checks
  const wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  // Start actual NASA investigation
  const handleInvestigation = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setMessage("Please select a location from the dropdown.");
      return;
    }

    if (category !== "Land Changes" && category !== "Deforestation") {
      setMessage(
        "The NASA NDVI analysis is currently available for Land Changes and Deforestation investigations only."
      );
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage("The start date must be before the end date.");
      return;
    }

    if (new Date(endDate) > new Date()) {
      setMessage("Please select an end date that is not in the future.");
      return;
    }

    setIsInvestigating(true);
    setInvestigationResults(null);
    setMessage("Connecting to NASA AppEEARS...");

    try {
      const [longitude, latitude] = selectedLocation.coordinates;

      // 1. Submit the NDVI task to NASA
      const submitResponse = await fetch("/api/nasa/ndvi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
          startDate,
          endDate,
        }),
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok || submitData.success === false) {
        throw new Error(
          submitData.message || submitData.error || "NASA task submission failed."
        );
      }

      const taskId =
        submitData.taskId ||
        submitData.task_id ||
        submitData.task?.task_id;

      if (!taskId) {
        throw new Error("NASA did not return a task ID.");
      }

      setMessage("NASA task submitted. Waiting for satellite data...");

      // 2. Check the task status until NASA finishes processing
      let completed = false;
      let statusData = null;

      for (let attempt = 0; attempt < 120; attempt++) {
        await wait(5000);

        const statusResponse = await fetch(
          `/api/nasa/ndvi/status?taskId=${encodeURIComponent(taskId)}`
        );

        statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusData.message || statusData.error || "Unable to check NASA task status."
          );
        }

        if (statusData.status === "done") {
          completed = true;
          break;
        }

        if (
          statusData.status === "error" ||
          statusData.status === "failed" ||
          statusData.crashed === true
        ) {
          throw new Error(
            statusData.error || "NASA could not complete the analysis."
          );
        }

        setMessage(
          `NASA is processing your satellite data... (${attempt + 1}/120)`
        );
      }

      if (!completed) {
        throw new Error(
          "NASA is still processing this task. Please try again later."
        );
      }

      setMessage("NASA processing completed. Downloading measurements...");

      // 3. Download the CSV results
      const downloadResponse = await fetch(
        `/api/nasa/ndvi/download?taskId=${encodeURIComponent(taskId)}`
      );

      const downloadData = await downloadResponse.json();

      if (!downloadResponse.ok || !downloadData.success) {
        throw new Error(
          downloadData.message ||
          downloadData.error ||
          "Unable to download NASA results."
        );
      }

      if (!downloadData.csvContent) {
        throw new Error("The downloaded NASA CSV file is empty.");
      }

      // 4. Extract and calculate the actual NDVI measurements
      const analysis = calculateNDVI(downloadData.csvContent);

      setInvestigationResults({
        ...analysis,
        taskId,
        fileName: downloadData.fileName,
        location: selectedLocation.label,
        coordinates: {
          latitude,
          longitude,
        },
        category,
        startDate,
        endDate,
      });

      setMessage("NASA investigation completed successfully!");
    } catch (error) {
      console.error("Investigation error:", error);
      setMessage(error.message || "Something went wrong during the investigation.");
    } finally {
      setIsInvestigating(false);
    }
  };

  const interpretation = investigationResults
    ? getInterpretation(investigationResults)
    : null;

  return (
    <main className="investigate-page">

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">✦</span>
          geoDetective
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/#how-it-works">How It Works</Link>
        </div>

        <Link href="/" className="nav-button">
          ← Back Home
        </Link>
      </nav>

      {/* Header */}
      <section className="investigate-header">
        <span className="section-tag">
          YOUR NEXT DISCOVERY STARTS HERE
        </span>

        <h1>
          Start an <span>Investigation.</span>
        </h1>

        <p>
          Choose a location, select what interests you, and
          uncover the secrets hidden in Earth's satellite data.
        </p>
      </section>

      {/* Investigation content */}
      <section className="investigation-container">

        {/* Form */}
        <div className="investigation-form">

          <div className="form-heading">
            <span>01</span>

            <div>
              <h2>Investigation Details</h2>
              <p>Tell us what you want to explore.</p>
            </div>
          </div>

          <form onSubmit={handleInvestigation}>

            <label htmlFor="location">
              Investigation Location
            </label>

            <div className="location-input location-container">
              <span>⌖</span>

              <input
                id="location"
                type="text"
                placeholder={
                  loadingLocations
                    ? "Loading locations..."
                    : "Search for a city or location..."
                }
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setSelectedLocation(null);
                  setShowLocations(true);
                  setMessage("");
                  setInvestigationResults(null);
                }}
                onFocus={() => setShowLocations(true)}
                disabled={loadingLocations || isInvestigating}
                autoComplete="off"
              />

              {showLocations && locationInput.trim().length >= 2 && (
                <div className="location-dropdown">

                  {locationResults.length > 0 ? (
                    locationResults.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="location-option"
                        onClick={() => handleLocationSelect(item)}
                      >
                        <span>{item.name}</span>

                        <small>
                          {[
                            item.admin1,
                            item.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </small>
                      </button>
                    ))
                  ) : (
                    <div className="location-status">
                      {allLocations.length === 0
                        ? "No location data available."
                        : "No matching locations found."}
                    </div>
                  )}

                </div>
              )}
            </div>

            <label>
              What would you like to investigate?
            </label>

            <div className="category-options">
              {[
                {
                  name: "Land Changes",
                  icon: "🌍",
                  desc: "Land use and surface changes",
                },
                {
                  name: "Deforestation",
                  icon: "🌳",
                  desc: "Forest loss and vegetation",
                },
                {
                  name: "Water Bodies",
                  icon: "💧",
                  desc: "Changes in lakes and water",
                },
                {
                  name: "Urban Growth",
                  icon: "🏙️",
                  desc: "Expansion of urban areas",
                },
                {
                  name: "Climate Patterns",
                  icon: "🌡️",
                  desc: "Environmental patterns",
                },
                {
                  name: "Natural Disasters",
                  icon: "🌋",
                  desc: "Environmental events",
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className={`category-card ${
                    category === item.name ? "selected" : ""
                  }`}
                  onClick={() => {
                    setCategory(item.name);
                    setMessage("");
                    setInvestigationResults(null);
                  }}
                  disabled={isInvestigating}
                >
                  <span className="category-icon">
                    {item.icon}
                  </span>

                  <strong>{item.name}</strong>
                  <small>{item.desc}</small>
                </button>
              ))}
            </div>

            <label htmlFor="start-date">
              Observation Period
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <small
                  style={{
                    display: "block",
                    color: "#a8bad0",
                    marginBottom: "7px",
                  }}
                >
                  Start date
                </small>

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isInvestigating}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #36516f",
                    background: "#172b45",
                    color: "#ffffff",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div>
                <small
                  style={{
                    display: "block",
                    color: "#a8bad0",
                    marginBottom: "7px",
                  }}
                >
                  End date
                </small>

                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isInvestigating}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #36516f",
                    background: "#172b45",
                    color: "#ffffff",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="start-investigation"
              disabled={isInvestigating}
            >
              {isInvestigating
                ? "Analyzing NASA Data..."
                : "Start Investigation →"}
            </button>

            {message && (
              <p
                className="form-message"
                role="status"
                style={{
                  overflowWrap: "anywhere",
                }}
              >
                {message}
              </p>
            )}

          </form>
        </div>

        {/* Preview */}
        <div className="investigation-preview">

          <div className="preview-top">
            <div>
              <span className="preview-label">
                MISSION PREVIEW
              </span>

              <h3>Earth Explorer</h3>
            </div>

            <span className="satellite-icon">🛰️</span>
          </div>

          {/* Actual NASA satellite map */}
          <div className="earth-preview">
            <SatelliteMap
              location={selectedLocation}
              category={category}
            />
          </div>

          <div className="preview-info">
            <div>
              <span>LOCATION</span>

              <strong>
                {selectedLocation?.label || "Not selected"}
              </strong>
            </div>

            <div>
              <span>INVESTIGATION TYPE</span>
              <strong>{category}</strong>
            </div>
          </div>

          <div className="preview-note">
            <span>✦</span>

            <p>
              Every location has a story. Use satellite observations
              to uncover it.
            </p>
          </div>

        </div>
      </section>

      {/* NASA analysis results */}
      {investigationResults && (
        <section
          style={{
            maxWidth: "1100px",
            width: "90%",
            margin: "55px auto",
            padding: "30px",
            background: "#101d32",
            border: "1px solid #263c57",
            borderRadius: "16px",
            color: "#ffffff",
          }}
        >
          <div style={{ marginBottom: "25px" }}>
            <span
              style={{
                color: "#69d5ff",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "1.5px",
              }}
            >
              NASA DATA ANALYSIS
            </span>

            <h2 style={{ margin: "9px 0", fontSize: "25px" }}>
              Investigation Results
            </h2>

            <p style={{ color: "#a8bad0", fontSize: "13px" }}>
              {investigationResults.location} ·{" "}
              {formatDate(investigationResults.startDate)} –{" "}
              {formatDate(investigationResults.endDate)}
            </p>
          </div>

          {/* Summary statistics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "14px",
              marginBottom: "30px",
            }}
          >
            {[
              {
                label: "AVERAGE NDVI",
                value: investigationResults.average.toFixed(4),
              },
              {
                label: "HIGHEST NDVI",
                value: investigationResults.highest.ndvi.toFixed(4),
              },
              {
                label: "LOWEST NDVI",
                value: investigationResults.lowest.ndvi.toFixed(4),
              },
              {
                label: "OBSERVATIONS",
                value: investigationResults.observations.length,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "19px",
                  background: "#172b45",
                  border: "1px solid #263c57",
                  borderRadius: "10px",
                }}
              >
                <small
                  style={{
                    color: "#8da5bf",
                    fontSize: "10px",
                    letterSpacing: "1px",
                  }}
                >
                  {item.label}
                </small>

                <div
                  style={{
                    color: "#69d5ff",
                    fontSize: "25px",
                    fontWeight: "700",
                    marginTop: "9px",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* NDVI observations */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "17px" }}>
              NDVI Observation Timeline
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              {investigationResults.observations.map((item) => (
                <div key={item.date}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "7px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#c4d2e2" }}>
                      {formatDate(item.date)}
                    </span>

                    <strong style={{ color: "#69d5ff" }}>
                      {item.ndvi.toFixed(4)}
                    </strong>
                  </div>

                  <div
                    style={{
                      height: "9px",
                      background: "#263c57",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(0, Math.min(100, ((item.ndvi + 1) / 2) * 100))}%`,
                        background: "#59c8f2",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* First and last observation comparison */}
          <div
            style={{
              padding: "20px",
              background: "#172b45",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>
              Change Between First and Last Observation
            </h3>

            <p style={{ color: "#c4d2e2", fontSize: "14px" }}>
              First observation ({formatDate(investigationResults.first.date)}):{" "}
              <strong>{investigationResults.first.ndvi.toFixed(4)}</strong>
            </p>

            <p style={{ color: "#c4d2e2", fontSize: "14px" }}>
              Last observation ({formatDate(investigationResults.last.date)}):{" "}
              <strong>{investigationResults.last.ndvi.toFixed(4)}</strong>
            </p>

            <p
              style={{
                color: "#69d5ff",
                fontSize: "20px",
                fontWeight: "700",
                marginTop: "12px",
              }}
            >
              {investigationResults.change > 0 ? "+" : ""}
              {investigationResults.change.toFixed(4)} NDVI
            </p>
          </div>

          {/* Interpretation */}
          <div
            style={{
              padding: "20px",
              border: "1px solid #36516f",
              borderRadius: "10px",
              marginBottom: "22px",
            }}
          >
            <span
              style={{
                color: "#69d5ff",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              DATA-BASED INTERPRETATION
            </span>

            <h3 style={{ margin: "10px 0" }}>
              {interpretation.title}
            </h3>

            <p
              style={{
                color: "#c4d2e2",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              {interpretation.description}
            </p>
          </div>

          {/* Quality information */}
          <div
            style={{
              padding: "18px",
              background: "#172b45",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>
              NASA Data Quality
            </h3>

            {investigationResults.observations.map((item) => (
              <p
                key={item.date}
                style={{
                  color: "#c4d2e2",
                  fontSize: "12px",
                  lineHeight: "1.7",
                  marginBottom: "8px",
                }}
              >
                <strong>{formatDate(item.date)}:</strong>{" "}
                MODLAND: {item.quality}; VI usefulness: {item.usefulness}.
              </p>
            ))}
          </div>

          <p
            style={{
              color: "#8da5bf",
              fontSize: "12px",
              lineHeight: "1.7",
            }}
          >
            Dataset: NASA MODIS MOD13Q1.061, 250 m, 16-day NDVI.
            Measurements represent the selected coordinate, not the
            entire city or surrounding region. NDVI is an indicator of
            vegetation greenness, not direct proof of vegetation loss.
            Quality information should be considered when interpreting
            these observations.
          </p>

          <p
            style={{
              color: "#8da5bf",
              fontSize: "11px",
              marginTop: "12px",
              overflowWrap: "anywhere",
            }}
          >
            NASA task ID: {investigationResults.taskId}
          </p>
        </section>
      )}

      <footer>
        geoDetective © 2026 | NASA Space Apps Challenge
      </footer>

    </main>
  );
}
