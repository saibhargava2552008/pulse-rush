import type { Quality } from '../engine/quality';
import type { Bests } from './storage';

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

const SOON = ['Time Trial', 'Survival', 'Multiplayer with friends', 'Level select', 'Character customization', 'Profile'];

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
          <button className="btn big" onClick={onPlay}>Play Level 1 · Neon City</button>
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

          <div className="panel soon-panel">
            <h2>Coming later</h2>
            <ul>
              {SOON.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
