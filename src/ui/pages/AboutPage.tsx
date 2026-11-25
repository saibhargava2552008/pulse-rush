import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function AboutPage() {
  return (
    <ContentLayout pageTitle="About Pulse Rush">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Project Background</div>
          <h1 className="article-title">About Pulse Rush</h1>
          <p className="article-lead">
            A high-speed 3D cyberpunk obstacle runner engineered for instant playability in modern web browsers.
          </p>
        </header>

        <section className="article-section">
          <h2>Project Overview</h2>
          <p>
            Pulse Rush is an original web-based 3D runner created to bring fluid, responsive arcade gameplay directly
            to desktop and mobile browsers without requiring downloads, app stores, or plugins. Set in an electrifying
            neon cityscape, players navigate high-speed tracks by steering, jumping, sliding, and harnessing Pulse Energy
            to phase through laser hazards.
          </p>
          <p>
            Pulse Rush is engineered for tight movement kinematics, deterministic physics,
            smooth 60 Hz simulation updates, and responsive cross-platform play.
          </p>
        </section>

        <section className="article-section">
          <h2>Technical Architecture</h2>
          <p>
            Pulse Rush is built from the ground up using modern web technologies:
          </p>
          <ul className="feature-list">
            <li>
              <strong>Three.js (0.169):</strong> Powers the WebGL rendering pipeline, featuring procedural runner models,
              custom canvas gradient skyboxes, instanced track geometry, glowing neon rails, and dynamic point lights.
            </li>
            <li>
              <strong>Pure Simulation Engine:</strong> The game simulation operates on a fixed 60 Hz accumulator tick decoupled
              from the rendering frame rate. It has zero external dependencies, making movement perfectly reproducible.
            </li>
            <li>
              <strong>React 18 & TypeScript:</strong> Delivers a modular UI shell for menus, the real-time HUD, accessible touch controls,
              and informational website pages with strict static typing.
            </li>
            <li>
              <strong>Vite Build System:</strong> Ensures sub-second local development updates, tree-shaking, and optimized production chunking.
            </li>
            <li>
              <strong>Vitest:</strong> Rigorous unit test suite validating jump curves, fast-fall boundaries, collision hitboxes, and ad container behaviors.
            </li>
          </ul>
        </section>

        <section className="article-section">
          <h2>Developer & Creator</h2>
          <p>
            Pulse Rush was conceived, designed, and developed by <strong>Sai Bhargava Reddy</strong>.
          </p>
          <ul className="feature-list">
            <li><strong>Developer:</strong> Sai Bhargava Reddy</li>
            <li><strong>GitHub:</strong> <a href="https://github.com/saibhargava2552008" target="_blank" rel="noopener noreferrer">@saibhargava2552008</a></li>
            <li><strong>Project Repository:</strong> <a href="https://github.com/saibhargava2552008/pulse-rush" target="_blank" rel="noopener noreferrer">github.com/saibhargava2552008/pulse-rush</a></li>
          </ul>
        </section>

        <section className="article-section">
          <h2>Core Gameplay Systems</h2>
          <p>
            Pulse Rush delivers a complete arcade runner experience built on robust procedural systems:
          </p>
          <ul className="feature-list">
            <li><strong>Endless Marathon:</strong> An infinitely generating Neon City course scaling from 16 m/s to 30 m/s.</li>
            <li><strong>Energy Management:</strong> Regenerating Pulse Energy powering high-speed laser dash phasing.</li>
            <li><strong>Hazard Navigation:</strong> Six dynamic obstacle archetypes including sweepers, beams, and track gaps.</li>
            <li><strong>Local Progression:</strong> Persistent high-score, best-distance, and quality settings saved locally.</li>
          </ul>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn">Return to Game</Link>
          <Link to="/guide" className="btn ghost">Read Game Guide</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
