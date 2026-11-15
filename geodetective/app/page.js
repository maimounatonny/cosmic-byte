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
    example: "Is Qatar becoming hotter?",
    number: "01",
  },
  {
    id: "relationship",
    title: "Relationship Analysis",
    description:
      "Explore how different environmental variables relate to one another.",
    icon: "⇄",
    example: "Does rainfall relate to temperature?",
    number: "02",
  },
  {
    id: "explanation",
    title: "Environmental Explanation",
    description:
      "Investigate possible environmental factors behind changes happening on Earth.",
    icon: "✧",
    example: "Why is rainfall decreasing?",
    number: "03",
  },
];

const exampleQuestions = [
  // TREND ANALYSIS
  {
    question: "Is drought becoming more frequent?",
    type: "trend",
    scenarioId: "drought_trend",
  },
  {
    question: "Is global temperature increasing?",
    type: "trend",
    scenarioId: "temperature_trend",
  },

  // RELATIONSHIP ANALYSIS
  {
    question: "Does rainfall relate to temperature?",
    type: "relationship",
    scenarioId: "rainfall_temperature",
  },
  {
    question: "Does humidity relate to temperature?",
    type: "relationship",
    scenarioId: "humidity_temperature",
  },
  {
    question: "Does dew point relate to air temperature?",
    type: "relationship",
    scenarioId: "dewpoint_temperature",
  },
  {
    question: "Does solar radiation relate to temperature?",
    type: "relationship",
    scenarioId: "solar_temperature",
  },
  {
    question: "Does wind speed relate to temperature?",
    type: "relationship",
    scenarioId: "wind_temperature",
  },

  // ENVIRONMENTAL EXPLANATION
  {
    question: "Why is rainfall decreasing?",
    type: "explanation",
    scenarioId: "rainfall_explanation",
  },
  {
    question: "Why is temperature increasing?",
    type: "explanation",
    scenarioId: "temperature_explanation",
  },
  {
    question: "Why is humidity changing?",
    type: "explanation",
    scenarioId: "humidity_explanation",
  },
];

const processSteps = [
  {
    number: "01",
    icon: "⌕",
    title: "Ask a Question",
    description:
      "Describe an environmental problem or phenomenon you want to understand.",
  },
  {
    number: "02",
    icon: "◈",
    title: "Discover Variables",
    description:
      "Find relevant Earth science variables and explore available NASA datasets.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Analyze the Data",
    description:
      "Examine environmental trends, statistical significance and relationships.",
  },
  {
    number: "04",
    icon: "◎",
    title: "Explore Insights",
    description:
      "Understand patterns through interactive visualizations and scientific findings.",
  },
];

const HomePage = () => {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

  const selectedInvestigation = investigationTypes.find(
    (type) => type.id === selectedType,
  );

  const handleTypeSelection = (typeId) => {
    setSelectedType(typeId);
    setQuestion("");
    setSelectedScenarioId("");
  };

  const startInvestigation = (event) => {
    event.preventDefault();

    if (!selectedType || !question.trim()) {
      return;
    }

    const params = new URLSearchParams({
      type: selectedType,
      question: question.trim(),
    });

    if (selectedScenarioId) {
      params.set("scenarioId", selectedScenarioId);
    }

    router.push(`/investigate?${params.toString()}`);
  };

  const handleExampleClick = (example) => {
    setSelectedType(example.type);
    setQuestion(example.question);
    setSelectedScenarioId(example.scenarioId);

    document
      .getElementById("investigation-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);

    // If the user edits a predefined question,
    // remove its fixed scenario mapping.
    setSelectedScenarioId("");
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
            Turn your environmental questions into scientific investigations.
            Discover NASA data, uncover trends, and explore the relationships
            behind Earth's changing systems.
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

          {/* QUESTION FORM */}

          {selectedInvestigation && (
            <form
              id="investigation-form"
              className="question-form"
              onSubmit={startInvestigation}
            >
              <div className="form-heading">
                <div className="form-heading-icon">✧</div>

                <div>
                  <span className="form-step-label">YOUR INVESTIGATION</span>

                  <h3>Tell us what you want to discover</h3>
                </div>
              </div>

              <div className="selected-type-message">
                <span className="selected-check">✓</span>
                {selectedInvestigation.title}
              </div>

              <label htmlFor="environmental-question">
                Describe your environmental question
              </label>

              <textarea
                id="environmental-question"
                value={question}
                onChange={handleQuestionChange}
                placeholder={selectedInvestigation.example}
                rows={3}
                maxLength={500}
                required
              />

              <div className="form-bottom">
                <span className="input-hint">
                  Be specific about the environmental change you want to
                  investigate.
                </span>

                <button
                  type="submit"
                  className="start-button"
                  disabled={!question.trim()}
                >
                  Start Investigation
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {/* EXAMPLE QUESTIONS */}

          <div className="example-questions">
            <div className="example-heading">
              <span className="example-sparkle">✳</span>
              Need inspiration? Try asking:
            </div>

            <div className="example-question-list">
              {exampleQuestions.map((example) => (
                <button
                  key={example.scenarioId}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="example-chip"
                >
                  {example.question}
                  <span>↗</span>
                </button>
              ))}
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
};

export default HomePage;
