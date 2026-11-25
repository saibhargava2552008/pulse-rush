import type { Quality } from '../engine/quality';
import type { Bests } from './storage';
import { Link } from './router';

interface Props {
  quality: Quality;
  onQuality: (q: Quality) => void;
  onPlay: () => void;
  bests: Bests;
}

const QUALITIES: { id: Quality; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

const HIGHLIGHTS = [
  'Endless Track · Procedural Neon City scaling up to 30 m/s',
  'Pulse Phasing · Dash through laser hazards with timed energy',
  'Dynamic Obstacles · Dodge blocks, sweepers, and jump track gaps',
  'Local Records · Best distance, time, and high scores saved on device',
];

const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

export function Menu({ quality, onQuality, onPlay, bests }: Props) {
  return (
    <div className="menu">
      <div className="menu-grid" aria-hidden="true" />
      <main className="menu-main">
        <section className="menu-hero">
          <h1 className="logo">
            <span>Pulse</span>
            <span className="logo-b">Rush</span>
          </h1>
          <p className="tagline">Race the neon grid. Dash through lasers.</p>
          <div className="menu-hero-actions">
            <button className="btn big" onClick={onPlay}>Play Endless · Neon City</button>
            <Link to="/guide" className="btn ghost menu-guide-btn">Game Guide & Controls</Link>
          </div>
          {(bests.bestTime !== null || bests.bestDist > 0) && (
            <p className="bests">
              Best distance {Math.floor(bests.bestDist)} m
              {bests.bestTime !== null && <> · Best time {fmt(bests.bestTime)}</>}
            </p>
          )}
        </section>

        <section className="menu-side">
          <div className="panel">
            <h2>Graphics</h2>
            <div className="seg" role="radiogroup" aria-label="Graphics quality">
              {QUALITIES.map((q) => (
                <button key={q.id} role="radio" aria-checked={quality === q.id} className={quality === q.id ? 'on' : ''} onClick={() => onQuality(q.id)}>
                  {q.label}
                </button>
              ))}
            </div>
            <p className="note">Lower this if the game stutters on your phone.</p>
          </div>

          <div className="panel">
            <h2>Controls</h2>
            <p className="note">Keyboard: A/D or arrows steer, Space jump, Shift slide, E pulse dash, Esc pause.</p>
            <p className="note">Touch: drag the left side to steer, tap Jump, Slide and Dash on the right.</p>
          </div>

          <div className="panel menu-links-panel">
            <h2>Website Navigation</h2>
            <nav className="menu-nav-links" aria-label="Quick Links">
              <Link to="/guide" className="menu-nav-link">Gameplay Guide</Link>
              <Link to="/strategy" className="menu-nav-link">Strategy Guide</Link>
              <Link to="/about" className="menu-nav-link">About Project</Link>
              <Link to="/contact" className="menu-nav-link">Contact & Support</Link>
              <Link to="/privacy" className="menu-nav-link">Privacy Policy</Link>
              <Link to="/terms" className="menu-nav-link">Terms of Service</Link>
            </nav>
          </div>

          <div className="panel game-highlights-panel">
            <h2>Gameplay Highlights</h2>
            <ul className="highlights-list">
              {HIGHLIGHTS.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
