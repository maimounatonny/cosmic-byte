
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

const investigationTypes = [
  {
    id: "trend",
    title: "Trend Analysis",
    description:
      "Investigate whether an environmental variable is increasing or decreasing over time.",
    icon: "↗",
    example: "Is Qatar becoming hotter?",
  },
  {
    id: "relationship",
    title: "Relationship Analysis",
    description:
      "Explore whether two environmental variables are related.",
    icon: "⇄",
    example: "Does deforestation affect rainfall?",
  },
  {
    id: "explanation",
    title: "Environmental Explanation",
    description:
      "Explore possible environmental factors behind a particular change.",
    icon: "✧",
    example: "Why is rainfall decreasing in this region?",
  },
];

const exampleQuestions = [
  "Is drought becoming more frequent?",
  "Is global temperature increasing?",
  "Does vegetation cover relate to rainfall?",
];

export default function HomePage() {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("");
  const [question, setQuestion] = useState("");

  function handleTypeSelection(typeId) {
    setSelectedType(typeId);
    setQuestion("");
  }

  function startInvestigation(event) {
    event.preventDefault();

    if (!selectedType || !question.trim()) {
      return;
    }

    const params = new URLSearchParams({
      type: selectedType,
      question: question.trim(),
    });

    router.push(`/investigate?${params.toString()}`);
  }

  function handleExampleClick(example) {
    if (!selectedType) {
      setSelectedType("trend");
    }

    setQuestion(example);
  }

  const selectedInvestigation = investigationTypes.find(
    (type) => type.id === selectedType
  );

  return (
    <main className="homepage">
      {/* NAVIGATION */}

      <nav className="navbar">
        <div className="navbar-logo">
          <span className="logo-icon">◈</span>
          <span className="navbar-label">
            Earth System Trend Detective
          </span>
        </div>
      </nav>

      {/* HERO */}

      <section className="hero">
        <h1>
          Ask questions. Discover what is happening to{" "}
          <span>Earth.</span>
        </h1>

        {/* INVESTIGATION TYPE SELECTION */}

        <div className="question-container">
          <h2 className="selection-heading">
            What would you like to investigate?
          </h2>

          <p className="selection-description">
            Choose the type of environmental investigation you want
            to perform.
          </p>

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
                  <span className="type-icon">{type.icon}</span>

                  <span className="type-title">
                    {type.title}
                  </span>

                  <span className="type-description">
                    {type.description}
                  </span>

                  <span className="type-example">
                    Example: {type.example}
                  </span>

                  <span className="type-selection-indicator">
                    {isSelected ? "✓ Selected" : "Select →"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* QUESTION INPUT */}

          {selectedInvestigation && (
            <form
              className="question-form"
              onSubmit={startInvestigation}
            >
              <div className="selected-type-message">
                <span>✓</span>
                You selected: {selectedInvestigation.title}
              </div>

              <label htmlFor="environmental-question">
                What is your environmental question?
              </label>

              <textarea
                id="environmental-question"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder={selectedInvestigation.example}
                rows={3}
                required
              />

              <button
                type="submit"
                className="start-button"
                disabled={!question.trim()}
              >
                Start Investigation <span>→</span>
              </button>
            </form>
          )}
        </div>

        {/* EXAMPLE QUESTIONS */}

        <div className="example-questions">
          <span>Need inspiration?</span>

          <div className="example-question-list">
            {exampleQuestions.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="how-it-works">
        <div className="section-heading">
          <span>YOUR INVESTIGATION JOURNEY</span>
          <h2>From questions to scientific discoveries</h2>
          <p>
            Turn environmental curiosity into evidence-based
            investigations.
          </p>
        </div>

        <div className="process-grid">
          <div className="process-card">
            <span className="process-number">01</span>
            <h3>Choose Your Investigation</h3>
            <p>
              Select whether you want to investigate trends,
              relationships, or environmental explanations.
            </p>
          </div>

          <div className="process-card">
            <span className="process-number">02</span>
            <h3>Discover Variables</h3>
            <p>
              Identify relevant environmental measurements and
              suitable NASA datasets.
            </p>
          </div>

          <div className="process-card">
            <span className="process-number">03</span>
            <h3>Analyze the Data</h3>
            <p>
              Apply statistical methods to examine environmental
              patterns and relationships.
            </p>
          </div>

          <div className="process-card">
            <span className="process-number">04</span>
            <h3>Discover Insights</h3>
            <p>
              Explore visual results and evidence-based scientific
              interpretations.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="homepage-footer">
        <span>Earth System Trend Detective</span>
        <span>Exploring Earth through scientific evidence.</span>
      </footer>
    </main>
  );
}
