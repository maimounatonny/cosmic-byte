"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

const investigationTypes = [
  {
    id: "trend",
    title: "Trend Analysis",
    description:
      "Discover how environmental variables change over time and whether those changes are significant.",
    icon: "↗",
    example: "Explore changes in temperature over time.",
    number: "01",
  },
  {
    id: "relationship",
    title: "Relationship Analysis",
    description:
      "Explore how different environmental variables relate to one another.",
    icon: "⇄",
    example: "Compare rainfall and temperature.",
    number: "02",
  },
  {
    id: "explanation",
    title: "Environmental Explanation",
    description:
      "Investigate environmental factors associated with changes in a selected variable.",
    icon: "✧",
    example: "Discover factors related to rainfall.",
    number: "03",
  },
];

const countries = [
  "Qatar",
  "India",
  "Bangladesh",
  "United States",
  "United Kingdom",
];

const variables = [
  { id: "T2M", label: "Air Temperature", unit: "°C" },
  { id: "T2M_MAX", label: "Maximum Air Temperature", unit: "°C" },
  { id: "T2M_MIN", label: "Minimum Air Temperature", unit: "°C" },
  { id: "PRECTOTCORR", label: "Rainfall / Precipitation", unit: "mm/day" },
  { id: "RH2M", label: "Relative Humidity", unit: "%" },
  { id: "T2MDEW", label: "Dew Point Temperature", unit: "°C" },
  {
    id: "ALLSKY_SFC_SW_DWN",
    label: "Solar Radiation",
    unit: "kWh/m²/day",
  },
  { id: "WS10M", label: "Wind Speed", unit: "m/s" },
  { id: "QV2M", label: "Specific Humidity", unit: "g/kg" },
  { id: "TS", label: "Earth Skin Temperature", unit: "°C" },
];

const processSteps = [
  {
    number: "01",
    icon: "⌕",
    title: "Choose an Investigation",
    description:
      "Select whether you want to study trends, compare variables or investigate environmental relationships.",
  },
  {
    number: "02",
    icon: "◈",
    title: "Select NASA Variables",
    description:
      "Choose environmental measurements from the available NASA POWER dataset.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Analyze the Data",
    description:
      "Retrieve measurements and examine environmental trends and statistical relationships.",
  },
  {
    number: "04",
    icon: "◎",
    title: "Explore Insights",
    description:
      "Understand patterns through visualizations, statistical findings and related variables.",
  },
];

const currentYear = 2024;
const firstYear = 1981;

const yearOptions = Array.from(
  { length: currentYear - firstYear + 1 },
  (_, index) => String(firstYear + index),
);

export default function HomePage() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("");
  const [country, setCountry] = useState("Qatar");
  const [mainVariable, setMainVariable] = useState("T2M");
  const [secondVariable, setSecondVariable] = useState("PRECTOTCORR");
  const [startYear, setStartYear] = useState("1981");
  const [endYear, setEndYear] = useState("2024");
  const [formError, setFormError] = useState("");

  const selectedInvestigation = investigationTypes.find(
    (item) => item.id === selectedType,
  );

  const handleTypeSelection = (typeId) => {
    setSelectedType(typeId);
    setFormError("");
  };

  const startInvestigation = (event) => {
    event.preventDefault();
    setFormError("");

    if (!selectedType) {
      setFormError("Please select an investigation type.");
      return;
    }

    if (!country || !mainVariable) {
      setFormError("Please select a location and environmental variable.");
      return;
    }

    if (selectedType === "relationship" && !secondVariable) {
      setFormError("Please select the second environmental variable.");
      return;
    }

    if (selectedType === "relationship" && mainVariable === secondVariable) {
      setFormError("Please select two different environmental variables.");
      return;
    }

    const start = Number(startYear);
    const end = Number(endYear);

    if (start > end) {
      setFormError("The start year cannot be later than the end year.");
      return;
    }

    if (end - start + 1 < 10) {
      setFormError("Please select a study period covering at least 10 years.");
      return;
    }

    const params = new URLSearchParams({
      type: selectedType,
      country,
      variable: mainVariable,
      startYear,
      endYear,
    });

    if (selectedType === "relationship") {
      params.set("secondVariable", secondVariable);
    }

    router.push(`/investigate?${params.toString()}`);
  };

  const handleExampleClick = (type, variable, second = "") => {
    setSelectedType(type);
    setMainVariable(variable);

    if (second) {
      setSecondVariable(second);
    }

    setFormError("");

    document
      .getElementById("investigation-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="homepage">
      {/* NAVIGATION */}

      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="navbar-logo">
            <span className="logo-icon">◈</span>

            <span className="navbar-brand">
              <span className="brand-name">Earth System</span>
              <span className="brand-subtitle">TREND DETECTIVE</span>
            </span>
          </a>

          <div className="navbar-right">
            <span className="nasa-label">
              <span className="status-dot" />
              POWERED BY NASA EARTH SCIENCE DATA
            </span>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            EXPLORE. ANALYZE. DISCOVER.
            <span className="eyebrow-line" />
          </div>

          <h1>
            Understand the changes
            <br />
            <span>shaping our planet.</span>
          </h1>

          <p className="hero-description">
            Turn environmental measurements into scientific insights. Explore
            NASA data, uncover trends and investigate the relationships behind
            Earth's changing systems.
          </p>

          <div className="hero-highlights">
            <span>
              <span className="highlight-icon">◈</span>
              NASA Earth Science Data
            </span>

            <span>
              <span className="highlight-icon">↗</span>
              Statistical Analysis
            </span>

            <span>
              <span className="highlight-icon">◎</span>
              Interactive Insights
            </span>
          </div>
        </div>
      </section>

      {/* INVESTIGATION BUILDER */}

      <section className="investigation-section">
        <div className="investigation-panel">
          <div className="panel-heading">
            <div>
              <span className="section-eyebrow">START EXPLORING</span>

              <h2>What would you like to investigate?</h2>

              <p>Choose an investigation type to get started.</p>
            </div>

            <div className="panel-decoration">✳</div>
          </div>

          {/* INVESTIGATION TYPES */}

          <div className="investigation-type-grid">
            {investigationTypes.map((type) => {
              const isSelected = selectedType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  className={`investigation-type-card ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleTypeSelection(type.id)}
                  aria-pressed={isSelected}
                >
                  <div className="type-card-top">
                    <span className="type-number">{type.number}</span>
                    <span className="type-icon">{type.icon}</span>
                  </div>

                  <span className="type-title">{type.title}</span>

                  <span className="type-description">{type.description}</span>

                  <span className="type-example">
                    Example: "{type.example}"
                  </span>

                  <span className="type-selection-indicator">
                    {isSelected ? (
                      <>
                        <span>✓</span> Selected
                      </>
                    ) : (
                      <>
                        Select investigation <span>→</span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DROPDOWN INVESTIGATION FORM */}

          {selectedInvestigation && (
            <form
              id="investigation-form"
              className="question-form"
              onSubmit={startInvestigation}
            >
              <div className="form-heading">
                <div className="form-heading-icon">✧</div>

                <div>
                  <span className="form-step-label">
                    INVESTIGATION PARAMETERS
                  </span>

                  <h3>Configure your investigation</h3>
                </div>
              </div>

              <div className="selected-type-message">
                <span className="selected-check">✓</span>
                {selectedInvestigation.title}
              </div>

              {/* LOCATION */}

              <div className="form-field">
                <label htmlFor="country">Select location</label>

                <select
                  id="country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                >
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <span className="input-hint">
                  Choose the country whose environmental measurements you want
                  to investigate.
                </span>
              </div>

              {/* MAIN VARIABLE */}

              <div className="form-field">
                <label htmlFor="main-variable">
                  {selectedType === "relationship"
                    ? "Select the first environmental variable"
                    : "Select environmental variable"}
                </label>

                <select
                  id="main-variable"
                  value={mainVariable}
                  onChange={(event) => setMainVariable(event.target.value)}
                >
                  {variables.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* SECOND VARIABLE */}

              {selectedType === "relationship" && (
                <div className="form-field">
                  <label htmlFor="second-variable">
                    Select the second environmental variable
                  </label>

                  <select
                    id="second-variable"
                    value={secondVariable}
                    onChange={(event) => setSecondVariable(event.target.value)}
                  >
                    {variables.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={item.id === mainVariable}
                      >
                        {item.label} ({item.unit})
                      </option>
                    ))}
                  </select>

                  <span className="input-hint">
                    Choose a different variable to compare with the first one.
                  </span>
                </div>
              )}

              {/* EXPLANATION INFORMATION */}

              {selectedType === "explanation" && (
                <div className="selected-type-message">
                  <span className="selected-check">✓</span>
                  The application will automatically examine other available
                  environmental variables related to your selected variable.
                </div>
              )}

              {/* STUDY PERIOD */}

              <div className="form-field">
                <label>Choose study period</label>

                <div className="year-selection">
                  <div>
                    <label htmlFor="start-year">Start year</label>

                    <select
                      id="start-year"
                      value={startYear}
                      onChange={(event) => setStartYear(event.target.value)}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="end-year">End year</label>

                    <select
                      id="end-year"
                      value={endYear}
                      onChange={(event) => setEndYear(event.target.value)}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <span className="input-hint">
                  Available study period: 1981–2024. At least 10 years are
                  required for this investigation.
                </span>
              </div>

              {formError && (
                <div className="form-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="form-bottom">
                <span className="input-hint">
                  Your selections will determine which NASA measurements are
                  retrieved and analyzed.
                </span>

                <button type="submit" className="start-button">
                  Start Investigation
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* EXAMPLE SHORTCUTS */}

          <div className="example-questions">
            <div className="example-heading">
              <span className="example-sparkle">✳</span>
              Need inspiration? Try an example:
            </div>

            <div className="example-question-list">
              <button
                type="button"
                className="example-chip"
                onClick={() => handleExampleClick("trend", "T2M")}
              >
                Explore temperature trends
                <span>↗</span>
              </button>

              <button
                type="button"
                className="example-chip"
                onClick={() =>
                  handleExampleClick("relationship", "T2M", "PRECTOTCORR")
                }
              >
                Compare temperature and rainfall
                <span>↗</span>
              </button>

              <button
                type="button"
                className="example-chip"
                onClick={() => handleExampleClick("explanation", "PRECTOTCORR")}
              >
                Investigate rainfall patterns
                <span>↗</span>
              </button>

              <button
                type="button"
                className="example-chip"
                onClick={() =>
                  handleExampleClick("relationship", "T2M", "RH2M")
                }
              >
                Compare temperature and humidity
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="how-it-works">
        <div className="how-inner">
          <div className="section-heading">
            <span className="section-eyebrow">THE PROCESS</span>

            <h2>
              From curiosity to
              <span> discovery.</span>
            </h2>

            <p>
              A simple path from environmental questions to evidence-based
              scientific insights.
            </p>
          </div>

          <div className="process-grid">
            {processSteps.map((step) => (
              <div className="process-card" key={step.number}>
                <div className="process-card-top">
                  <span className="process-number">{step.number}</span>
                  <span className="process-icon">{step.icon}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="homepage-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">◈</span>

            <div>
              <strong>Earth System Trend Detective</strong>
              <span>Exploring Earth through scientific evidence.</span>
            </div>
          </div>

          <div className="footer-note">
            An Earth science exploration experience
          </div>
        </div>
      </footer>
    </main>
  );
}
