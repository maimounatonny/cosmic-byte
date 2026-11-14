
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./page.css";

const typeLabels = {
  trend: "Trend Analysis",
  relationship: "Relationship Analysis",
  explanation: "Environmental Explanation",
};

const variableLabels = {
  T2M: {
    name: "Average Temperature",
    description:
      "The average air temperature measured across the sampled locations.",
  },
  T2M_MAX: {
    name: "Maximum Temperature",
    description:
      "The average of daily maximum air temperatures across the sampled locations.",
  },
  T2M_MIN: {
    name: "Minimum Temperature",
    description:
      "The average of daily minimum air temperatures across the sampled locations.",
  },
};

function formatNumber(value, decimals = 3) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "Not available";
  }

  return Number(value).toFixed(decimals);
}

function formatPValue(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "Not available";
  }

  const pValue = Number(value);

  if (pValue < 0.001) {
    return "p < 0.001";
  }

  return `p = ${pValue.toFixed(4)}`;
}

function getVariableName(variable) {
  return variableLabels[variable]?.name || variable;
}

function TemperatureChart({ annualData, variable }) {
  if (!annualData || annualData.length < 2) {
    return (
      <div className="chart-empty">
        Not enough annual measurements to display a chart.
      </div>
    );
  }

  const values = annualData
    .map((item) => Number(item.averageTemperature))
    .filter(Number.isFinite);

  if (values.length < 2) {
    return (
      <div className="chart-empty">
        Temperature measurements are unavailable.
      </div>
    );
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const chartWidth = 800;
  const chartHeight = 260;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const points = annualData
    .filter((item) =>
      Number.isFinite(Number(item.averageTemperature))
    )
    .map((item, index, array) => {
      const x =
        paddingLeft +
        (index / Math.max(array.length - 1, 1)) * plotWidth;

      const y =
        paddingTop +
        ((maxValue - Number(item.averageTemperature)) / range) *
          plotHeight;

      return {
        x,
        y,
        year: item.year,
        temperature: Number(item.averageTemperature),
      };
    });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const firstYear = annualData[0]?.year;
  const lastYear = annualData[annualData.length - 1]?.year;

  const middleYear = Math.round(
    (Number(firstYear) + Number(lastYear)) / 2
  );

  return (
    <div className="temperature-chart">
      <div className="chart-heading">
        <div>
          <span className="detail-label">ANNUAL MEASUREMENTS</span>
          <h4>{getVariableName(variable)}</h4>
        </div>

        <span className="chart-unit">°C</span>
      </div>

      <div className="chart-container">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${getVariableName(
            variable
          )} from ${firstYear} to ${lastYear}`}
          preserveAspectRatio="none"
        >
          {[0, 1, 2, 3].map((index) => {
            const y =
              paddingTop + (index / 3) * plotHeight;

            const value =
              maxValue - (index / 3) * range;

            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  className="chart-grid-line"
                />

                <text
                  x={paddingLeft - 10}
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
            points={linePoints}
            fill="none"
            className="chart-line"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            index === 0 ||
            index === points.length - 1 ||
            index % 5 === 0 ? (
              <circle
                key={`${point.year}-${index}`}
                cx={point.x}
                cy={point.y}
                r="3"
                className="chart-point"
              />
            ) : null
          ))}

          <text
            x={paddingLeft}
            y={chartHeight - 8}
            className="chart-axis-label"
          >
            {firstYear}
          </text>

          <text
            x={paddingLeft + plotWidth / 2}
            y={chartHeight - 8}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {middleYear}
          </text>

          <text
            x={chartWidth - paddingRight}
            y={chartHeight - 8}
            textAnchor="end"
            className="chart-axis-label"
          >
            {lastYear}
          </text>
        </svg>
      </div>

      <p className="chart-caption">
        Annual average temperature measurements from {firstYear} to{" "}
        {lastYear}. Each point represents one year's average.
      </p>
    </div>
  );
}

function ResultCard({ result }) {
  const trend = result.trend;
  const variable = result.variable;

  const isIncreasing = trend?.direction === "increasing";
  const isSignificant = trend?.significant;

  return (
    <article className="result-card">
      <div className="result-card-header">
        <div>
          <span className="detail-label">
            TEMPERATURE VARIABLE
          </span>

          <h3>{getVariableName(variable)}</h3>

          <p className="result-variable-description">
            {variableLabels[variable]?.description || ""}
          </p>
        </div>

        <span
          className={`trend-status ${
            isIncreasing ? "trend-increasing" : "trend-decreasing"
          }`}
        >
          <span>{isIncreasing ? "↗" : "↘"}</span>
          {trend?.direction || "Unknown"}
        </span>
      </div>

      <div className="result-metrics">
        <div className="result-metric">
          <span className="metric-label">Annual change</span>

          <strong>
            {formatNumber(trend?.slopePerYear, 4)}
          </strong>

          <span className="metric-unit">°C per year</span>
        </div>

        <div className="result-metric">
          <span className="metric-label">Total estimated change</span>

          <strong>
            {formatNumber(trend?.totalChange, 2)}
          </strong>

          <span className="metric-unit">°C over the study period</span>
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
        <span className="significance-icon">
          {isSignificant ? "✓" : "ⓘ"}
        </span>

        <div>
          <strong>
            {isSignificant
              ? "Evidence of a statistically significant trend"
              : "The trend is not statistically significant"}
          </strong>

          <p>
            {isSignificant
              ? "The p-value is below 0.05, providing statistical evidence that the measured temperature trend is different from zero under the regression model."
              : "The p-value is not below 0.05. The available data do not provide sufficient statistical evidence of a non-zero linear trend under this model."}
          </p>
        </div>
      </div>

      <TemperatureChart
        annualData={result.annualData}
        variable={variable}
      />
    </article>
  );
}

function InvestigationContent() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "";
  const question = searchParams.get("question") || "";

  const typeLabel = typeLabels[type] || "Not specified";

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSupportedQuestion =
    type === "trend" &&
    /qatar/i.test(question) &&
    /(hot|temperatur|warm)/i.test(question);

  useEffect(() => {
    if (!isSupportedQuestion) {
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
        const response = await fetch("/api/nasa/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startYear: 1981,
            endYear: 2024,
          }),
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Temperature analysis failed."
          );
        }

        setAnalysis(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Temperature analysis error:", err);

          setError(
            err.message || "Unable to complete the temperature analysis."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    runAnalysis();

    return () => {
      controller.abort();
    };
  }, [isSupportedQuestion]);

  const results = analysis?.results || [];

  const significantCount = results.filter(
    (result) => result.trend?.significant
  ).length;

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
          <span className="investigation-badge">
            YOUR RESEARCH QUESTION
          </span>

          <h1>Let's investigate.</h1>

          <p>
            Explore environmental measurements and discover what
            the scientific evidence tells us.
          </p>
        </header>

        <section className="submitted-question-card">
          <div className="submitted-question-section">
            <span className="detail-label">
              INVESTIGATION TYPE
            </span>

            <h2>{typeLabel}</h2>
          </div>

          <div className="question-divider"></div>

          <div className="submitted-question-section">
            <span className="detail-label">
              YOUR QUESTION
            </span>

            <p className="submitted-question-text">
              {question || "No question was provided."}
            </p>
          </div>
        </section>

        <section className="analysis-section">
          <div className="dataset-section-heading">
            <span className="detail-label">
              SCIENTIFIC ANALYSIS
            </span>

            <h2>What do the measurements tell us?</h2>

            <p>
              We retrieve NASA Earth science measurements and
              examine how temperature has changed over time.
              Statistical analysis helps us determine whether
              the observed trend is significant.
            </p>
          </div>

          {loading && (
            <div className="dataset-message">
              <div className="loading-spinner"></div>

              <h3>Analyzing NASA temperature measurements</h3>

              <p>
                Retrieving observations and calculating annual
                temperature trends and p-values.
              </p>

              <span>This may take a few moments.</span>
            </div>
          )}

          {!loading && error && (
            <div className="dataset-message error-message">
              <h3>We couldn't complete the analysis</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !isSupportedQuestion && (
            <div className="dataset-message">
              <h3>This analysis is not available yet</h3>

              <p>
                The current analysis module supports the Trend
                Analysis question: "Is Qatar getting hotter?"
                It retrieves Qatar temperature measurements
                from NASA POWER and calculates their statistical
                trends.
              </p>

              <p>
                Other investigation questions and types will need
                their own data retrieval and analysis methods.
              </p>
            </div>
          )}

          {!loading && !error && analysis && (
            <>
              <section className="analysis-overview">
                <div className="analysis-overview-heading">
                  <span className="detail-label">
                    OVERALL FINDING
                  </span>

                  <h3>
                    {significantCount === results.length &&
                    results.length > 0
                      ? "All three temperature measures are increasing."
                      : "Temperature trends have been analyzed."}
                  </h3>

                  <p>
                    The measurements from the sampled locations
                    show the following results for{" "}
                    {analysis.studyPeriod?.startYear}–{" "}
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
                    <strong>
                      {analysis.variablesAnalyzed || results.length}
                    </strong>

                    <span>Temperature variables</span>
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
                <span className="detail-label">
                  DETAILED RESULTS
                </span>

                <h3>Temperature trends</h3>

                <p>
                  Each result shows the direction of change,
                  estimated rate of change, and statistical
                  significance of the trend.
                </p>
              </div>

              <div className="results-list">
                {results.map((result) => (
                  <ResultCard
                    key={result.variable}
                    result={result}
                  />
                ))}
              </div>

              <section className="methodology-card">
                <span className="detail-label">
                  HOW WAS THIS CALCULATED?
                </span>

                <h3>Understanding the analysis</h3>

                <div className="methodology-item">
                  <h4>1. Data collection</h4>

                  <p>
                    Daily temperature measurements were retrieved
                    from NASA POWER for five sample locations in
                    Qatar: Doha, Al Khor, Dukhan, Mesaieed, and
                    Abu Samra.
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>2. Annual averages</h4>

                  <p>
                    Daily measurements were combined into annual
                    average temperatures for each variable.
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>3. Linear regression</h4>

                  <p>
                    A linear regression model was used to estimate
                    the direction and rate of temperature change
                    over the study period.
                  </p>
                </div>

                <div className="methodology-item">
                  <h4>4. Statistical significance</h4>

                  <p>
                    A p-value was calculated to test whether the
                    estimated linear trend differs from zero.
                    A p-value below 0.05 is treated as statistically
                    significant in this analysis.
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
                    <strong>Spatial coverage:</strong> The result
                    is an average of available measurements from
                    five sample locations. It is not an
                    area-weighted average of every location in Qatar.
                  </li>

                  <li>
                    <strong>Statistical model:</strong> The p-values
                    use ordinary linear regression and do not
                    account for possible autocorrelation in annual
                    temperatures. This can affect the reliability
                    of statistical significance estimates.
                  </li>

                  <li>
                    <strong>Correlation and causation:</strong> An
                    increasing temperature trend does not, by
                    itself, identify the causes of that increase.
                  </li>

                  <li>
                    <strong>Interpretation:</strong> Statistical
                    significance does not automatically mean that
                    a change is large or practically important.
                  </li>
                </ul>
              </section>

              <div className="data-source-note">
                <span>ⓘ</span>

                <div>
                  <strong>Data source: {analysis.dataSource}</strong>

                  <p>
                    Study period: {analysis.studyPeriod?.startYear}–
                    {analysis.studyPeriod?.endYear}. Spatial method:{" "}
                    {analysis.spatialMethod ||
                      "Average of available measurements from five sample locations"}
                    .
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
