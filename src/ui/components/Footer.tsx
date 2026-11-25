import { Link } from '../router';

export function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__container">
        <div className="footer-col footer-col--brand">
          <div className="footer-logo">
            <span className="brand-pulse">Pulse</span>
            <span className="brand-rush">Rush</span>
          </div>
          <p className="footer-desc">
            A high-speed 3D cyberpunk obstacle runner built for the browser using WebGL and Three.js.
            Race down neon tracks, dodge hazards, and surge through lasers with Pulse Energy.
          </p>
          <p className="footer-meta">
            Pulse Rush · WebGL / React / TypeScript
          </p>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Navigation</h3>
          <ul className="footer-links">
            <li><Link to="/">Play Game</Link></li>
            <li><Link to="/guide">Game Guide & Controls</Link></li>
            <li><Link to="/strategy">Runner Strategy Guide</Link></li>
            <li><Link to="/about">About the Project</Link></li>
            <li><Link to="/contact">Contact & Feedback</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Legal & Privacy</h3>
          <ul className="footer-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li>
              <a
                href="https://github.com/saibhargava2552008/pulse-rush"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-external-link"
              >
                GitHub Repository ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            © 2026 Pulse Rush. Created by <strong>Sai Bhargava Reddy</strong>. All rights reserved.
          </p>
          <p className="tech-badge">
            Built with React, TypeScript & Three.js WebGL
          </p>
        </div>
      </div>
    </footer>
  );
}
