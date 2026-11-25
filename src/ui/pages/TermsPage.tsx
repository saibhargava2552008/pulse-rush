import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function TermsPage() {
  return (
    <ContentLayout pageTitle="Terms of Service">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Legal Documentation</div>
          <h1 className="article-title">Terms of Service</h1>
          <p className="article-lead">
            Last Updated: November 25, 2026. Please read these terms carefully before accessing or playing Pulse Rush.
          </p>
        </header>

        <section className="article-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or playing Pulse Rush at{' '}
            <a href="https://pulse-rush-ten.vercel.app" target="_blank" rel="noopener noreferrer">
              pulse-rush-ten.vercel.app
            </a>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="article-section">
          <h2>2. License to Use</h2>
          <p>
            Permission is granted to access and play Pulse Rush for personal, non-commercial entertainment purposes. Under this license, you may not:
          </p>
          <ul className="feature-list">
            <li>Modify, reverse engineer, or decompile game simulation code for commercial exploitation.</li>
            <li>Use automated bots, scripts, or cheats to manipulate game performance or local records.</li>
            <li>Frame or mirror the game website on any other server without prior written permission.</li>
            <li>Attempt to interfere with website availability, infrastructure, or advertising delivery.</li>
          </ul>
        </section>

        <section className="article-section">
          <h2>3. Intellectual Property Rights</h2>
          <p>
            All original game designs, visual assets, 3D meshes, gameplay mechanics, logos, and code are the intellectual property
            of <strong>Sai Bhargava Reddy</strong>, unless otherwise noted. All rights are reserved.
          </p>
        </section>

        <section className="article-section">
          <h2>4. Disclaimer of Warranties (&ldquo;As Is&rdquo;)</h2>
          <p>
            Pulse Rush is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
            We make no warranties, expressed or implied, regarding game performance, uninterrupted service, compatibility with all devices,
            or the absence of bugs.
          </p>
        </section>

        <section className="article-section">
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall the developer or contributors of Pulse Rush be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the game.
          </p>
        </section>

        <section className="article-section">
          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to revise these terms of service at any time without notice. By using this website, you agree to be bound
            by the current version of these Terms of Service.
          </p>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn">Return to Game</Link>
          <Link to="/privacy" className="btn ghost">Privacy Policy</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
