import { Link } from '../router';
import { ContentLayout } from '../components/ContentLayout';

export function PrivacyPage() {
  return (
    <ContentLayout pageTitle="Privacy Policy">
      <article className="prose-article">
        <header className="article-header">
          <div className="article-badge">Legal Documentation</div>
          <h1 className="article-title">Privacy Policy</h1>
          <p className="article-lead">
            Last Updated: November 25, 2026. This policy describes how Pulse Rush manages user data and respects your privacy.
          </p>
        </header>

        <section className="article-section">
          <h2>1. Introduction</h2>
          <p>
            Pulse Rush (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the game&rdquo;) is an independent web-based game hosted at{' '}
            <a href="https://pulse-rush-ten.vercel.app" target="_blank" rel="noopener noreferrer">
              pulse-rush-ten.vercel.app
            </a>. We are committed to transparency regarding how data is used when you visit our website.
          </p>
        </section>

        <section className="article-section">
          <h2>2. Information We Store Locally (Web Storage)</h2>
          <p>
            Pulse Rush does not require user registration, passwords, or personal accounts. To provide a functional gaming experience,
            the game uses your browser&rsquo;s <code>localStorage</code> solely to save your progress locally on your own device:
          </p>
          <ul className="feature-list">
            <li>
              <strong>Gameplay Best Records (<code>pulse-rush:v1:bests:level-1</code>):</strong> Stores your highest distance, best time,
              and highest score so your records persist between sessions.
            </li>
            <li>
              <strong>Graphics Preferences (<code>pulse-rush:v1:quality</code>):</strong> Stores your chosen graphics quality setting
              (Low, Medium, or High) to ensure smooth performance on subsequent visits.
            </li>
          </ul>
          <p>
            This information remains strictly on your local device. It is never transmitted to any external server or backend database by the game engine.
            You can clear these records at any time by clearing your browser cache and local storage.
          </p>
        </section>

        <section className="article-section">
          <h2>3. Advertising & Cookies (Google AdSense)</h2>
          <p>
            We use Google AdSense to serve advertisements on select pages of our website. Google and its advertising partners use cookies
            to serve ads based on your prior visits to this website or other websites on the internet.
          </p>
          <ul className="feature-list">
            <li>
              Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>.
            </li>
            <li>
              Alternatively, you can opt out of third-party vendors&rsquo; use of cookies for personalized advertising by visiting{' '}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
                www.aboutads.info
              </a>.
            </li>
          </ul>
        </section>

        <section className="article-section">
          <h2>4. Third-Party Hosting & Log Files</h2>
          <p>
            Pulse Rush is hosted on Vercel. Like most web hosting platforms, standard server logs may collect technical connection data
            including IP addresses, browser user-agents, referring URLs, and request timestamps to maintain security, prevent DDoS attacks,
            and monitor service reliability.
          </p>
        </section>

        <section className="article-section">
          <h2>5. Your Privacy Rights (GDPR & CCPA)</h2>
          <p>
            Depending on your jurisdiction (such as the European Economic Area under GDPR or California under CCPA/CPRA), you may have the right to:
          </p>
          <ul className="feature-list">
            <li>Access, delete, or limit the processing of any personal information collected.</li>
            <li>Opt out of the sale or sharing of personal data for cross-context behavioral advertising.</li>
            <li>Experience no discrimination for exercising your privacy rights.</li>
          </ul>
          <p>
            Because we do not collect personal identifiers or maintain user accounts, the only data tied to your browser session is stored locally
            in your own browser cache or handled by standard advertising cookies as outlined above.
          </p>
        </section>

        <section className="article-section">
          <h2>6. Contact Us</h2>
          <p>
            If you have questions or concerns regarding this Privacy Policy, please contact the developer at{' '}
            <strong>s.saibhargav2552008@gmail.com</strong> or submit an inquiry through our{' '}
            <Link to="/contact">Contact Page</Link>.
          </p>
        </section>

        <footer className="article-footer">
          <Link to="/" className="btn">Return to Game</Link>
          <Link to="/terms" className="btn ghost">Terms of Service</Link>
        </footer>
      </article>
    </ContentLayout>
  );
}
