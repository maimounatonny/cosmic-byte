"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./page.css";

const typeLabels = {
  trend: "Trend Analysis",
  relationship: "Relationship Analysis",
  explanation: "Environmental Explanation",
};

const variableInfo = {
  T2M: {
    name: "Average Air Temperature",
    unit: "°C",
  },
  T2M_MAX: {
    name: "Maximum Air Temperature",
    unit: "°C",
  },
  T2M_MIN: {
    name: "Minimum Air Temperature",
    unit: "°C",
  },
  PRECTOTCORR: {
    name: "Corrected Precipitation",
    unit: "mm/day",
  },
  RH2M: {
    name: "Relative Humidity",
    unit: "%",
  },
  T2MDEW: {
    name: "Dew Point Temperature",
    unit: "°C",
  },
  ALLSKY_SFC_SW_DWN: {
    name: "Solar Radiation",
    unit: "kWh/m²/day",
  },
  WS10M: {
    name: "Wind Speed at 10 Metres",
    unit: "m/s",
  },
  QV2M: {
    name: "Specific Humidity",
    unit: "g/kg",
  },
  TS: {
    name: "Earth Skin Temperature",
    unit: "°C",
  },
};

function getVariableName(variable) {
  return variableInfo[variable]?.name || variable || "Environmental variable";
}

function getVariableUnit(variable) {
  return variableInfo[variable]?.unit || "";
}

function formatNumber(value, decimals = 3) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "Not available";
  }

  return Number(value).toFixed(decimals);
}

function formatPValue(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "Not available";
  }

  const pValue = Number(value);

  return pValue < 0.001 ? "p < 0.001" : `p = ${pValue.toFixed(4)}`;
}

/* ---------------- TREND ANALYSIS ---------------- */

function TemperatureChart({ annualData, variable, unit }) {
  if (!annualData || annualData.length < 2) {
    return (
      <div className="chart-empty">
        Not enough annual measurements to display a chart.
      </div>
    );
  }

  const validData = annualData.filter((item) => {
    const value = item.value ?? item.averageTemperature;

    return (
      value !== null && value !== undefined && Number.isFinite(Number(value))
    );
  });

  if (validData.length < 2) {
    return (
      <div className="chart-empty">
        Measurements are unavailable for this variable.
      </div>
    );
  }

  const getValue = (item) => Number(item.value ?? item.averageTemperature);

  const values = validData.map(getValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const width = 800;
  const height = 260;
  const left = 65;
  const right = 20;
  const top = 20;
  const bottom = 35;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const points = validData.map((item, index) => ({
    x: left + (index / Math.max(validData.length - 1, 1)) * plotWidth,
    y: top + ((maxValue - getValue(item)) / range) * plotHeight,
    year: item.year,
  }));

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");

  const firstYear = validData[0].year;
  const lastYear = validData[validData.length - 1].year;
  const middleYear = Math.round((Number(firstYear) + Number(lastYear)) / 2);

  return (
    <div className="temperature-chart">
      <div className="chart-heading">
        <div>
          <span className="detail-label">ANNUAL MEASUREMENTS</span>
          <h4>{getVariableName(variable)}</h4>
        </div>
        <span className="chart-unit">{unit}</span>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${getVariableName(variable)} from ${firstYear} to ${lastYear}`}
          preserveAspectRatio="none"
        >
          {[0, 1, 2, 3].map((index) => {
            const y = top + (index / 3) * plotHeight;
            const value = maxValue - (index / 3) * range;

            return (
              <g key={index}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  className="chart-grid-line"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          <polyline
            points={line}
            fill="none"
            className="chart-line"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) =>
            index === 0 || index === points.length - 1 || index % 5 === 0 ? (
              <circle
                key={`${point.year}-${index}`}
                cx={point.x}
                cy={point.y}
                r="3"
                className="chart-point"
              />
            ) : null,
          )}

          <text x={left} y={height - 8} className="chart-axis-label">
            {firstYear}
          </text>
          <text
            x={left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {middleYear}
          </text>
          <text
            x={width - right}
            y={height - 8}
            textAnchor="end"
            className="chart-axis-label"
          >
            {lastYear}
          </text>
        </svg>
      </div>

      <p className="chart-caption">
        Annual average measurements from {firstYear} to {lastYear}.
      </p>
    </div>
  );
}

function ResultCard({ result }) {
  const trend = result.trend;
  const variable = result.variable;
  const unit = result.unit || getVariableUnit(variable);
  const isIncreasing = trend?.direction === "increasing";
  const isSignificant = trend?.significant;

  return (
    <article className="result-card">
      <div className="result-card-header">
        <div>
          <span className="detail-label">SELECTED ENVIRONMENTAL VARIABLE</span>
          <h3>{getVariableName(variable)}</h3>
        </div>

        <span
          className={`trend-status ${
            isIncreasing ? "trend-increasing" : "trend-decreasing"
          }`}
        >
          <span>
            {trend?.direction === "increasing"
              ? "↗"
              : trend?.direction === "decreasing"
                ? "↘"
                : "→"}
          </span>
          {trend?.direction || "Unknown"}
        </span>
      </div>

      <div className="result-metrics">
        <div className="result-metric">
          <span className="metric-label">Annual change</span>
          <strong>{formatNumber(trend?.slopePerYear, 4)}</strong>
          <span className="metric-unit">{unit} per year</span>
        </div>

        <div className="result-metric">
          <span className="metric-label">Total estimated change</span>
          <strong>{formatNumber(trend?.totalChange, 2)}</strong>
          <span className="metric-unit">{unit} over the study period</span>
        </div>

        <div className="result-metric">
          <span className="metric-label">Statistical significance</span>
          <strong className={isSignificant ? "significant-value" : ""}>
            {formatPValue(trend?.pValue)}
          </strong>
          <span className="metric-unit">
            {isSignificant
              ? "Statistically significant"
              : "Not statistically significant"}
          </span>
        </div>
      </div>

      <div className="significance-explanation">
        <span className="significance-icon">{isSignificant ? "✓" : "ⓘ"}</span>
        <div>
          <strong>
            {isSignificant
              ? "Evidence of a statistically significant trend"
              : "The trend is not statistically significant"}
          </strong>
          <p>
            {isSignificant
              ? "The p-value is below 0.05, providing statistical evidence that the measured trend differs from zero under the regression model."
              : "The p-value is not below 0.05. The available data do not provide sufficient statistical evidence of a non-zero linear trend under this model."}
          </p>
        </div>
      </div>

      <TemperatureChart
        annualData={result.annualData}
        variable={variable}
        unit={unit}
      />
    </article>
  );
}

/* ---------------- CORRELATION DISPLAY ---------------- */

function CorrelationStrengthGuide() {
  const ranges = [
    { range: "0.80 to 1.00", label: "Very strong" },
    { range: "0.60 to 0.79", label: "Strong" },
    { range: "0.40 to 0.59", label: "Moderate" },
    { range: "0.20 to 0.39", label: "Weak" },
    { range: "0.00 to 0.19", label: "Very weak" },
  ];

  return (
    <section className="methodology-card">
      <h3>How do we understand correlation?</h3>
      <p>
        Correlation measures how consistently two variables move in relation to
        each other. Its value ranges from -1 to +1. The strength categories
        below use the absolute value of the correlation.
      </p>

      <div style={{ display: "grid", gap: "9px" }}>
        {ranges.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <strong>{item.label}</strong>
            <span>{item.range}</span>
          </div>
        ))}
      </div>

      <p>
        Positive correlation means the variables tend to move in the same
        direction. Negative correlation means they tend to move in opposite
        directions. These strength ranges are general guidelines, not universal
        scientific rules.
      </p>
    </section>
  );
}

function ComparisonChart({ data, firstName, secondName }) {
  if (!data || data.length < 2) {
    return (
      <div className="chart-empty">
        Not enough paired annual measurements to display a graph.
      </div>
    );
  }

  const firstValues = data.map((item) => {
    const value =
      item.firstAnomaly ?? item.mainAnomaly ?? item.variableAAnomaly;

    return value === null || value === undefined || value === ""
      ? null
      : Number(value);
  });

  const secondValues = data.map((item) => {
    const value =
      item.secondAnomaly ?? item.variableAnomaly ?? item.variableBAnomaly;

    return value === null || value === undefined || value === ""
      ? null
      : Number(value);
  });

  const valid = [...firstValues, ...secondValues].filter(
    (value) => value !== null && Number.isFinite(value),
  );

  if (valid.length === 0) {
    return (
      <div className="chart-empty">
        The comparison measurements are unavailable.
      </div>
    );
  }

  const width = 800;
  const height = 300;
  const left = 55;
  const right = 20;
  const top = 25;
  const bottom = 40;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxAbsolute = Math.max(2, ...valid.map(Math.abs));

  const getX = (index) =>
    left + (index / Math.max(data.length - 1, 1)) * plotWidth;

  const getY = (value) =>
    top + ((maxAbsolute - value) / (2 * maxAbsolute)) * plotHeight;

  const makePoints = (values) =>
    values
      .map((value, index) =>
        value !== null && Number.isFinite(value)
          ? `${getX(index)},${getY(value)}`
          : null,
      )
      .filter(Boolean)
      .join(" ");

  const firstYear = data[0].year;
  const lastYear = data[data.length - 1].year;
  const middleYear = Math.round((Number(firstYear) + Number(lastYear)) / 2);

  return (
    <div className="temperature-chart">
      <div className="chart-heading">
        <div>
          <span className="detail-label">YEAR-TO-YEAR COMPARISON</span>
          <h4>
            {firstName} and {secondName}
          </h4>
        </div>
        <span className="chart-unit">Standard deviations</span>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Comparison of ${firstName} and ${secondName}`}
          preserveAspectRatio="none"
        >
          {[-2, -1, 0, 1, 2].map((value) => (
            <g key={value}>
              <line
                x1={left}
                y1={getY(value)}
                x2={width - right}
                y2={getY(value)}
                className="chart-grid-line"
              />
              <text
                x={left - 10}
                y={getY(value) + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {value}
              </text>
            </g>
          ))}

          <polyline
            points={makePoints(firstValues)}
            fill="none"
            stroke="#a64b45"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <polyline
            points={makePoints(secondValues)}
            fill="none"
            stroke="#397e83"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <text x={left} y={height - 10} className="chart-axis-label">
            {firstYear}
          </text>
          <text
            x={left + plotWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {middleYear}
          </text>
          <text
            x={width - right}
            y={height - 10}
            textAnchor="end"
            className="chart-axis-label"
          >
            {lastYear}
          </text>
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "12px",
          fontSize: "13px",
        }}
      >
        <span>
          <span style={{ color: "#a64b45" }}>━</span> {firstName}
        </span>
        <span>
          <span style={{ color: "#397e83" }}>━</span> {secondName}
        </span>
      </div>

      <p className="chart-caption">
        Values are standardized anomalies after removing the fitted linear
        trend. Positive values indicate observations above the fitted trend;
        negative values indicate observations below it.
      </p>
    </div>
  );
}

/* ---------------- RELATIONSHIP ANALYSIS ---------------- */

function RelationshipResults({ result }) {
  const comparison = result.results?.primaryComparison;

  if (!comparison) {
    return (
      <div className="dataset-message">
        <h3>No comparison result was returned</h3>
        <p>Please check the scenario API response.</p>
      </div>
    );
  }

  const correlation = comparison.correlation;

  const validCorrelation =
    correlation !== null &&
    correlation !== undefined &&
    Number.isFinite(Number(correlation));

  const firstName =
    comparison.variableA?.name || getVariableName(comparison.variableA?.id);

  const secondName =
    comparison.variableB?.name || getVariableName(comparison.variableB?.id);

  return (
    <>
      <section className="analysis-overview">
        <div className="analysis-overview-heading">
          <span className="detail-label">CORRELATION RESULT</span>
          <h3>
            {firstName} and {secondName}
          </h3>
          <p>
            The correlation is calculated using paired annual measurements from{" "}
            {result.location}.
          </p>
        </div>

        <div className="overview-stats">
          <div className="overview-stat">
            <strong>
              {validCorrelation ? Number(correlation).toFixed(3) : "N/A"}
            </strong>
            <span>Pearson correlation (r)</span>
          </div>

          <div className="overview-stat">
            <strong>{comparison.strength || "Not available"}</strong>
            <span>Relationship strength</span>
          </div>

          <div className="overview-stat">
            <strong>{comparison.direction || "Unavailable"}</strong>
            <span>Relationship direction</span>
          </div>
        </div>
      </section>

      <section className="result-card">
        <span className="detail-label">WHAT DOES THIS MEAN?</span>

        <h3>
          {validCorrelation
            ? `${comparison.strength || ""} ${(comparison.direction || "").toLowerCase()} correlation`
            : "Correlation could not be calculated"}
        </h3>

        <p>
          {comparison.interpretation ||
            "The correlation describes how the two variables move together."}
        </p>

        <p>
          Correlation describes an association. It does not prove that one
          variable causes the other to change.
        </p>

        <div className="result-metrics">
          <div className="result-metric">
            <span className="metric-label">Paired years</span>
            <strong>{comparison.sampleSize ?? "N/A"}</strong>
          </div>

          <div className="result-metric">
            <span className="metric-label">Correlation method</span>
            <strong>Detrended Pearson</strong>
          </div>

          <div className="result-metric">
            <span className="metric-label">Study period</span>
            <strong>
              {result.studyPeriod?.startYear}–{result.studyPeriod?.endYear}
            </strong>
          </div>
        </div>
      </section>

      <ComparisonChart
        data={comparison.comparisonData}
        firstName={firstName}
        secondName={secondName}
      />

      <CorrelationStrengthGuide />
    </>
  );
}

/* ---------------- ENVIRONMENTAL EXPLANATION ---------------- */

function ExplanationResults({ result }) {
  const [selected, setSelected] = useState(null);

  const explanationResults = result.results?.comparisons || [];
  const targetVariable = result.results?.targetVariable;

  const mainName = targetVariable?.name || getVariableName(targetVariable?.id);

  const selectedResult = explanationResults.find(
    (item) => item.variableB?.id === selected,
  );

  return (
    <>
      <section className="analysis-overview">
        <div className="analysis-overview-heading">
          <span className="detail-label">ENVIRONMENTAL EXPLANATION</span>
          <h3>{result.title || `Understanding ${mainName}`}</h3>
          <p>{result.explanation || result.description}</p>
        </div>

        <div className="overview-stats">
          <div className="overview-stat">
            <strong>{explanationResults.length}</strong>
            <span>Variables compared</span>
          </div>

          <div className="overview-stat">
            <strong>
              {result.studyPeriod?.startYear}–{result.studyPeriod?.endYear}
            </strong>
            <span>Study period</span>
          </div>

          <div className="overview-stat">
            <strong>{result.location || "—"}</strong>
            <span>Study location</span>
          </div>
        </div>
      </section>

      <div className="results-heading">
        <span className="detail-label">RELATED VARIABLES</span>
        <h3>
          Which variables show the strongest relationships with{" "}
          {mainName.toLowerCase()}?
        </h3>
        <p>
          The variables are ranked by the absolute detrended correlation value,
          from strongest to weakest. Select a variable to view its comparison
          graph.
        </p>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {explanationResults.map((item, index) => {
          const variable = item.variableB;
          const value = item.correlation;

          const valid =
            variable?.id &&
            value !== null &&
            value !== undefined &&
            Number.isFinite(Number(value));

          const isSelected = selected === variable?.id;

          return (
            <button
              type="button"
              key={variable?.id || index}
              disabled={!valid}
              onClick={() => setSelected(isSelected ? null : variable?.id)}
              aria-pressed={isSelected}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
                width: "100%",
                padding: "17px",
                borderRadius: "10px",
                border: isSelected ? "2px solid #397e83" : "1px solid #e1e5e5",
                background: isSelected ? "#f0f7f6" : "#fff",
                textAlign: "left",
                cursor: valid ? "pointer" : "default",
                opacity: valid ? 1 : 0.65,
              }}
            >
              <span>
                <strong>
                  {index + 1}. {variable?.name || "Unknown variable"}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "12px",
                    opacity: 0.7,
                  }}
                >
                  {variable?.id || "Unknown code"} ·{" "}
                  {variable?.unit || "Unit unavailable"} ·{" "}
                  {item.strength || "Unknown"} {item.direction || ""}
                </span>
              </span>

              <strong style={{ fontSize: "18px", whiteSpace: "nowrap" }}>
                {valid ? Number(value).toFixed(3) : "N/A"}
              </strong>
            </button>
          );
        })}
      </div>

      {explanationResults.length === 0 && (
        <div className="dataset-message">
          No related-variable results were returned.
        </div>
      )}

      <CorrelationStrengthGuide />

      {selectedResult && (
        <section className="result-card" style={{ marginTop: "22px" }}>
          <span className="detail-label">SELECTED RELATIONSHIP</span>

          <h3>
            {mainName} and {selectedResult.variableB?.name}
          </h3>

          <div className="result-metrics">
            <div className="result-metric">
              <span className="metric-label">Correlation</span>
              <strong>{formatNumber(selectedResult.correlation)}</strong>
            </div>

            <div className="result-metric">
              <span className="metric-label">Strength</span>
              <strong>{selectedResult.strength || "N/A"}</strong>
            </div>

            <div className="result-metric">
              <span className="metric-label">Direction</span>
              <strong>{selectedResult.direction || "N/A"}</strong>
            </div>
          </div>

          <p>{selectedResult.interpretation}</p>

          <ComparisonChart
            data={selectedResult.comparisonData}
            firstName={mainName}
            secondName={selectedResult.variableB?.name || "Related variable"}
          />

          <p>
            This relationship may help describe environmental patterns, but
            correlation alone cannot establish that this variable caused the
            observed change.
          </p>
        </section>
      )}
    </>
  );
}

/* ---------------- RELATED VARIABLE EXPLORER ---------------- */

/* ---------------- RELATED VARIABLE EXPLORER ---------------- */

function CorrelationExplorer({ country, studyPeriod, variable }) {
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVariable, setSelectedVariable] = useState(null);

  async function findRelatedVariables() {
    setLoading(true);
    setError("");
    setCorrelations(null);
    setSelectedVariable(null);

    try {
      const response = await fetch("/api/nasa/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "explanation",
          country,
          variable,
          startYear: studyPeriod?.startYear ?? 1981,
          endYear: studyPeriod?.endYear ?? 2024,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `The analysis API returned a non-JSON response (HTTP ${response.status}). Check the API route and server terminal.`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to discover related variables.");
      }

      setCorrelations(data);
    } catch (err) {
      console.error("Correlation discovery error:", err);
      setError(err.message || "Unable to retrieve correlation measurements.");
    } finally {
      setLoading(false);
    }
  }

  const results = correlations?.results?.comparisons || [];
  const referenceName = getVariableName(variable);

  return (
    <section className="related-explorer">
      {/* INTRODUCTION CARD */}

      {!correlations && !loading && !error && (
        <div className="related-variables-section">
          <div className="related-variables-content">
            <div className="related-icon">
              <span>✳</span>
            </div>

            <span className="related-eyebrow">GO BEYOND THE BASICS</span>

            <h3>
              What other factors are related to
              <span> {referenceName.toLowerCase()}?</span>
            </h3>

            <p className="related-description">
              Explore other NASA environmental measurements and discover how
              they relate to {referenceName.toLowerCase()} in {country}.
            </p>

            <div className="related-info">
              <div className="related-info-icon">↗</div>

              <p>
                We will compare {referenceName.toLowerCase()} with other
                supported NASA environmental variables and rank their
                correlations from strongest to weakest.
              </p>
            </div>

            <button
              type="button"
              className="related-variables-button"
              onClick={findRelatedVariables}
            >
              <span>Find Related Variables</span>
              <span className="related-button-arrow">→</span>
            </button>

            <span className="related-footnote">
              Discover patterns. Explore connections. Uncover insights.
            </span>
          </div>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="dataset-message">
          <div className="loading-spinner"></div>

          <h3>Discovering related environmental variables</h3>

          <p>Retrieving NASA measurements and calculating correlations.</p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="dataset-message error-message">
          <h3>We couldn't calculate the correlations</h3>
          <p>{error}</p>

          <button type="button" onClick={findRelatedVariables}>
            Try again
          </button>
        </div>
      )}

      {/* CORRELATION RESULTS */}

      {correlations && (
        <>
          <div className="results-heading">
            <span className="detail-label">DISCOVERED RELATIONSHIPS</span>

            <h3>
              Environmental factors related to {referenceName.toLowerCase()}
            </h3>

            <p>
              Results are ranked by absolute detrended Pearson correlation, from
              strongest to weakest.
            </p>
          </div>

          <div className="related-reference">
            <span className="related-reference-icon">◎</span>

            <div>
              <span className="detail-label">REFERENCE VARIABLE</span>
              <strong>{referenceName}</strong>
              <span>{country}</span>
            </div>
          </div>

          <div className="related-results-list">
            {results.map((item, index) => {
              const relatedVariable = item.variableB;
              const value = Number(item.correlation);
              const valid = Number.isFinite(value);

              const isSelected =
                selectedVariable?.variableB?.id === relatedVariable?.id;

              return (
                <button
                  key={relatedVariable?.id || index}
                  type="button"
                  disabled={!valid}
                  onClick={() => setSelectedVariable(isSelected ? null : item)}
                  className={`related-result-item ${
                    isSelected ? "related-result-selected" : ""
                  }`}
                >
                  <span className="related-result-rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="related-result-info">
                    <strong>
                      {relatedVariable?.name || "Unknown variable"}
                    </strong>

                    <span>
                      {relatedVariable?.id} · {item.strength} {item.direction}
                    </span>
                  </span>

                  <span className="related-result-value">
                    {valid ? value.toFixed(3) : "N/A"}
                  </span>

                  <span className="related-result-arrow">
                    {isSelected ? "−" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          {results.length === 0 && (
            <div className="dataset-message">
              <h3>No related variables were found</h3>
              <p>The analysis did not return any correlation results.</p>
            </div>
          )}

          {/* SELECTED VARIABLE DETAILS */}

          {selectedVariable && (
            <section className="result-card related-detail-card">
              <span className="detail-label">SELECTED RELATIONSHIP</span>

              <h3>
                {referenceName} and {selectedVariable.variableB?.name}
              </h3>

              <div className="result-metrics">
                <div className="result-metric">
                  <span className="metric-label">Correlation</span>
                  <strong>{formatNumber(selectedVariable.correlation)}</strong>
                </div>

                <div className="result-metric">
                  <span className="metric-label">Strength</span>
                  <strong>{selectedVariable.strength || "N/A"}</strong>
                </div>

                <div className="result-metric">
                  <span className="metric-label">Direction</span>
                  <strong>{selectedVariable.direction || "N/A"}</strong>
                </div>
              </div>

              <p>{selectedVariable.interpretation}</p>

              <ComparisonChart
                data={selectedVariable.comparisonData}
                firstName={referenceName}
                secondName={selectedVariable.variableB?.name}
              />

              <p>
                This relationship describes a statistical association. It does
                not establish that one variable causes the other to change.
              </p>
            </section>
          )}

          <CorrelationStrengthGuide />

          <button
            type="button"
            className="refresh-correlations-button"
            onClick={findRelatedVariables}
          >
            ↻ Refresh correlations
          </button>
        </>
      )}
    </section>
  );
}

/* ---------------- MAIN INVESTIGATION PAGE ---------------- */

function InvestigationContent() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "";
  const country = searchParams.get("country") || "";
  const variable = searchParams.get("variable") || "";
  const secondVariable = searchParams.get("secondVariable") || "";

  const startYear = Number(searchParams.get("startYear"));
  const endYear = Number(searchParams.get("endYear"));

  const typeLabel = typeLabels[type] || "Not specified";

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validYears =
    Number.isInteger(startYear) &&
    Number.isInteger(endYear) &&
    startYear >= 1981 &&
    endYear <= 2024 &&
    endYear >= startYear &&
    endYear - startYear + 1 >= 10;

  const validVariable = Boolean(variableInfo[variable]);

  const validSecondVariable =
    type !== "relationship" ||
    (Boolean(variableInfo[secondVariable]) && secondVariable !== variable);

  const isSupported =
    ["trend", "relationship", "explanation"].includes(type) &&
    Boolean(country) &&
    validVariable &&
    validSecondVariable &&
    validYears;

  useEffect(() => {
    if (!isSupported) {
      setAnalysis(null);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function runAnalysis() {
      setLoading(true);
      setError("");
      setAnalysis(null);

      try {
        const endpoint =
          type === "trend" ? "/api/nasa/analyze" : "/api/nasa/scenario";

        const body = {
          type,
          country,
          variable,
          startYear,
          endYear,
        };

        if (type === "relationship") {
          body.secondVariable = secondVariable;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const responseText = await response.text();
        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The analysis API returned a non-JSON response (HTTP ${response.status}). Check the API route and server terminal.`,
          );
        }

        if (!response.ok || result.success === false) {
          throw new Error(
            result.error || "The analysis could not be completed.",
          );
        }

        setAnalysis(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Investigation analysis error:", err);
          setError(err.message || "Unable to complete the investigation.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    runAnalysis();

    return () => controller.abort();
  }, [
    isSupported,
    type,
    country,
    variable,
    secondVariable,
    startYear,
    endYear,
  ]);

  const results = Array.isArray(analysis?.results) ? analysis.results : [];

  const trendResult = results[0];

  const significantCount = results.filter(
    (item) => item.trend?.significant,
  ).length;

  const isTrend = type === "trend";
  const isRelationship = type === "relationship";
  const isExplanation = type === "explanation";

  const allResultsIncreasing =
    results.length > 0 &&
    results.every((item) => item.trend?.direction === "increasing");

  return (
    <main className="investigation-page">
      <nav className="investigation-navbar">
        <a href="/" className="investigation-logo">
          <span className="logo-icon">◈</span>
          <span>Earth System Trend Detective</span>
        </a>

        <a href="/" className="back-home-link">
          ← Back to Home
        </a>
      </nav>

      <section className="investigation-content">
        <header className="investigation-header">
          <span className="investigation-badge">YOUR INVESTIGATION</span>

          <h1>Let's investigate.</h1>

          <p>
            Explore environmental measurements and discover what the scientific
            evidence tells us.
          </p>
        </header>

        <section className="submitted-question-card">
          <div className="submitted-question-section">
            <span className="detail-label">INVESTIGATION TYPE</span>
            <h2>{typeLabel}</h2>
          </div>

          <div className="question-divider"></div>

          <div className="submitted-question-section">
            <span className="detail-label">STUDY LOCATION</span>
            <p className="submitted-question-text">
              {country || "Not selected"}
            </p>
          </div>

          <div className="question-divider"></div>

          <div className="submitted-question-section">
            <span className="detail-label">
              {isRelationship ? "SELECTED VARIABLES" : "ENVIRONMENTAL VARIABLE"}
            </span>

            <p className="submitted-question-text">
              {getVariableName(variable)}
              {isRelationship ? ` and ${getVariableName(secondVariable)}` : ""}
            </p>
          </div>

          <div className="question-divider"></div>

          <div className="submitted-question-section">
            <span className="detail-label">STUDY PERIOD</span>
            <p className="submitted-question-text">
              {Number.isInteger(startYear) && Number.isInteger(endYear)
                ? `${startYear}–${endYear}`
                : "Not selected"}
            </p>
          </div>
        </section>

        <section className="analysis-section">
          <div className="dataset-section-heading">
            <span className="detail-label">SCIENTIFIC ANALYSIS</span>
            <h2>What do the measurements tell us?</h2>
            <p>
              The application retrieves NASA Earth science measurements and
              analyzes trends or relationships according to your selected
              variables.
            </p>
          </div>

          {loading && (
            <div className="dataset-message">
              <div className="loading-spinner"></div>

              <h3>
                {isTrend
                  ? `Analyzing ${getVariableName(variable).toLowerCase()}`
                  : isRelationship
                    ? "Comparing the selected NASA variables"
                    : "Investigating related environmental variables"}
              </h3>

              <p>
                Retrieving NASA observations and performing the statistical
                analysis. This may take a few moments.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="dataset-message error-message">
              <h3>We couldn't complete the analysis</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !isSupported && (
            <div className="dataset-message">
              <h3>This investigation request is incomplete or invalid</h3>
              <p>
                Return to the homepage and select an investigation type,
                country, supported variable, and a study period of at least 10
                years between 1981 and 2024. Relationship analysis requires two
                different variables.
              </p>
            </div>
          )}

          {!loading && !error && analysis && isTrend && trendResult && (
            <>
              <section className="analysis-overview">
                <div className="analysis-overview-heading">
                  <span className="detail-label">OVERALL FINDING</span>

                  <h3>
                    {allResultsIncreasing
                      ? `${getVariableName(variable)} shows an increasing trend.`
                      : `${getVariableName(variable)} trend analysis is complete.`}
                  </h3>

                  <p>
                    Measurements from the sampled locations in{" "}
                    {analysis.location} show the following result for{" "}
                    {analysis.studyPeriod?.startYear}–
                    {analysis.studyPeriod?.endYear}.
                  </p>
                </div>

                <div className="overview-stats">
                  <div className="overview-stat">
                    <strong>
                      {analysis.observationCount?.toLocaleString() || "—"}
                    </strong>
                    <span>Daily observations</span>
                  </div>

                  <div className="overview-stat">
                    <strong>{analysis.variablesAnalyzed || 1}</strong>
                    <span>Variable analyzed</span>
                  </div>

                  <div className="overview-stat">
                    <strong>
                      {significantCount}/{results.length}
                    </strong>
                    <span>Significant trends</span>
                  </div>
                </div>
              </section>

              <div className="results-heading">
                <span className="detail-label">DETAILED RESULTS</span>
                <h3>{getVariableName(variable)} trend</h3>
                <p>
                  The result shows the direction of change, estimated rate of
                  change, and statistical significance.
                </p>
              </div>

              <div className="results-list">
                {results.map((item) => (
                  <ResultCard key={item.variable} result={item} />
                ))}
              </div>

              <CorrelationExplorer
                country={country}
                studyPeriod={analysis.studyPeriod}
                variable={variable}
              />

              <section className="methodology-card">
                <span className="detail-label">HOW WAS THIS CALCULATED?</span>

                <h3>Understanding the analysis</h3>

                <div className="methodology-item">
                  <h4>1. Data collection</h4>
                  <p>
                    Daily {getVariableName(variable).toLowerCase()} measurements
                    were retrieved from NASA POWER for five sample locations in{" "}
                    {analysis.location}:{" "}
                    {analysis.sampledLocations
                      ?.map((point) => point.name)
                      .join(", ") || "five selected sample locations"}
                    .
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>2. Annual averages</h4>
                  <p>
                    Daily measurements were combined into annual average values
                    for the selected environmental variable.
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>3. Linear regression</h4>
                  <p>
                    An ordinary least-squares linear regression model estimated
                    the direction and rate of change over the study period.
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>4. Statistical significance</h4>
                  <p>
                    A p-value below 0.05 is treated as statistically significant
                    in this analysis.
                  </p>
                </div>
              </section>

              <section className="analysis-limitations">
                <span className="detail-label">
                  IMPORTANT SCIENTIFIC LIMITATIONS
                </span>

                <h3>How should we interpret these results?</h3>

                <ul>
                  <li>
                    <strong>Spatial coverage:</strong> Results average
                    measurements from five selected sample locations. They are
                    not an area-weighted national average.
                  </li>

                  <li>
                    <strong>Statistical model:</strong> Ordinary linear
                    regression does not account for possible autocorrelation in
                    annual measurements.
                  </li>

                  <li>
                    <strong>Interpretation:</strong> Statistical significance
                    does not automatically mean a change is large or practically
                    important.
                  </li>
                </ul>
              </section>
            </>
          )}

          {!loading && !error && analysis && isRelationship && (
            <>
              <RelationshipResults result={analysis} />

              <div className="data-source-note">
                <span>ⓘ</span>
                <div>
                  <strong>
                    Data source: {analysis.dataSource || "NASA POWER"}
                  </strong>

                  <p>
                    Study period: {analysis.studyPeriod?.startYear}–
                    {analysis.studyPeriod?.endYear}. Spatial method:{" "}
                    {analysis.spatialMethod ||
                      "Average of selected sample locations"}
                    .
                  </p>
                </div>
              </div>
            </>
          )}

          {!loading && !error && analysis && isExplanation && (
            <>
              <ExplanationResults result={analysis} />

              <div className="data-source-note">
                <span>ⓘ</span>
                <div>
                  <strong>
                    Data source: {analysis.dataSource || "NASA POWER"}
                  </strong>

                  <p>
                    Study period: {analysis.studyPeriod?.startYear}–
                    {analysis.studyPeriod?.endYear}. The correlations describe
                    statistical associations, not proven causes.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="investigation-footer">
        <span>Earth System Trend Detective</span>
        <span>Exploring Earth through scientific evidence.</span>
      </footer>
    </main>
  );
}

export default function InvestigationPage() {
  return (
    <Suspense
      fallback={
        <main className="investigation-page">
          <div className="investigation-loading">
            Loading your investigation...
          </div>
        </main>
      }
    >
      <InvestigationContent />
    </Suspense>
  );
}
