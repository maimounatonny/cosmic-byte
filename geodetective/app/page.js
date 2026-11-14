
import Link from "next/link";
import "./page.css";

export default function Home() {
  return (
    <main className="home">
      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">✦</span>
          geoDetective
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="#about">About</Link>
          <Link href="#how-it-works">How It Works</Link>
        </div>

        <Link href="/investigate" className="nav-button">
          Start Exploring →
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="tag">
            ✦ NASA SPACE APPS CHALLENGE
          </span>

          <h1>
            The Earth is full of
            <span> mysteries.</span>
            <br />
            Let's investigate.
          </h1>

          <p>
            Explore our planet through satellite imagery,
            discover hidden patterns, and investigate
            environmental changes using the power of
            Earth observation data.
          </p>

          <div className="hero-buttons">
            <Link href="/investigate" className="primary-button">
              Start Investigating →
            </Link>

            <Link href="#about" className="secondary-button">
              Discover More
            </Link>
          </div>

          <div className="hero-caption">
            <span>✦</span> Powered by Earth observation data
          </div>
        </div>

        <div className="hero-visual">
          <div className="earth-glow"></div>
          <div className="earth">
            <div className="earth-label">
              <span className="live-dot"></span>
              EARTH OBSERVATION
            </div>
          </div>
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="floating-card">
            <span>🌍</span>
            <div>
              <strong>Our Planet</strong>
              <small>One world. Endless discoveries.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <span className="section-tag">EXPLORE • ANALYZE • DISCOVER</span>
        <h2>Become an Earth Detective.</h2>
        <p>
          Use satellite observations to uncover clues,
          understand environmental changes, and see
          our planet from a completely different perspective.
        </p>
      </section>

      <section className="features" id="how-it-works">
        <div className="feature-card">
          <span>🛰️</span>
          <h3>Explore Satellite Data</h3>
          <p>Discover our planet through Earth observation imagery.</p>
        </div>

        <div className="feature-card">
          <span>🔎</span>
          <h3>Investigate Clues</h3>
          <p>Examine locations and identify interesting environmental patterns.</p>
        </div>

        <div className="feature-card">
          <span>🌎</span>
          <h3>Uncover Discoveries</h3>
          <p>Turn observations into meaningful insights about Earth.</p>
        </div>
      </section>

      <footer>
        <p>geoDetective © 2026 | NASA Space Apps Challenge</p>
      </footer>
    </main>
  );
}
