import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function ContactPage() {
  return (
    <ContentLayout pageTitle="Contact & Support">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Support & Community</div>
          <h1 className="article-title">Contact & Feedback</h1>
          <p className="article-lead">
            Have feedback on gameplay, found a bug, or want to contribute? Connect directly with the developer.
          </p>
        </header>

        <section className="article-section">
          <h2>Get in Touch</h2>
          <p>
            Pulse Rush is actively developed and maintained. Whether you have suggestions for new obstacles,
            game balancing feedback, or device compatibility questions, your input is welcome.
          </p>

          <div className="grid-cards">
            <div className="info-card">
              <h3>GitHub Issues & Bug Reports</h3>
              <p>
                The primary hub for reporting technical bugs, tracking performance issues, or requesting features.
              </p>
              <a
                href="https://github.com/saibhargava2552008/pulse-rush/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="card-link"
              >
                Open an Issue on GitHub ↗
              </a>
            </div>

            <div className="info-card">
              <h3>Developer Email</h3>
              <p>
                For direct developer inquiries, partnership questions, or website feedback:
              </p>
              <p className="contact-email">
                <strong>s.saibhargav2552008@gmail.com</strong>
              </p>
            </div>

            <div className="info-card">
              <h3>Project Repository</h3>
              <p>
                Browse source code, track commit history, and view ongoing milestone releases.
              </p>
              <a
                href="https://github.com/saibhargava2552008/pulse-rush"
                target="_blank"
                rel="noopener noreferrer"
                className="card-link"
              >
                View GitHub Repository ↗
              </a>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>Reporting Gameplay Bugs</h2>
          <p>
            When reporting a bug, including the following details helps us reproduce and resolve it quickly:
          </p>
          <ul className="feature-list">
            <li><strong>Platform:</strong> Operating system (Windows, macOS, Linux, iOS, Android).</li>
            <li><strong>Browser:</strong> Name and version (Chrome, Edge, Safari, Firefox).</li>
            <li><strong>Input Method:</strong> Desktop Keyboard or Mobile Touch controls.</li>
            <li><strong>Graphics Quality:</strong> The selected quality setting (Low, Medium, High).</li>
            <li><strong>Description:</strong> What happened (e.g., collision anomaly, audio stutter, rendering artifact) and steps to reproduce.</li>
          </ul>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn">Return to Game</Link>
          <Link to="/about" className="btn ghost">About the Project</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
