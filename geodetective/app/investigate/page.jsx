
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
      <div style={{
        height: "290px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#69d5ff",
      }}>
        Loading satellite map...
      </div>
    ),
  }
);

export default function Investigate() {
  const [category, setCategory] = useState("Land Changes");
  const [message, setMessage] = useState("");

  const [allLocations, setAllLocations] = useState([]);
  const [locationResults, setLocationResults] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocations, setShowLocations] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);

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
  };

  // Start investigation
  const handleInvestigation = (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setMessage("Please select a location from the dropdown.");
      return;
    }

    setMessage(
      `Your ${category.toLowerCase()} investigation for ${selectedLocation.label} is ready to begin!`
    );

    console.log("Investigation details:", {
      location: selectedLocation.label,
      coordinates: selectedLocation.coordinates,
      category,
    });
  };

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
                }}
                onFocus={() => setShowLocations(true)}
                disabled={loadingLocations}
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
                  onClick={() => setCategory(item.name)}
                >
                  <span className="category-icon">
                    {item.icon}
                  </span>

                  <strong>{item.name}</strong>
                  <small>{item.desc}</small>
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="start-investigation"
            >
              Start Investigation →
            </button>

            {message && (
              <p className="form-message" role="status">
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
            <SatelliteMap location={selectedLocation} />
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

      <footer>
        geoDetective © 2026 | NASA Space Apps Challenge
      </footer>

    </main>
  );
}

