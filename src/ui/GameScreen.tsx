import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Engine } from '../engine/Engine';
import type { HudData } from '../engine/Engine';
import type { Quality } from '../engine/quality';
import { DASH_COST, ENERGY_MAX } from '../simulation/constants';
import { LEVEL_1 } from '../simulation/level';
import { TouchControls } from './TouchControls';
import { recordRun } from './storage';
import type { RunResult } from './storage';

type Phase = 'playing' | 'paused' | 'results';

const fmtTime = (t: number): string => {
  const m = Math.floor(t / 60);
  return `${m}:${(t - m * 60).toFixed(1).padStart(4, '0')}`;
};

export function GameScreen({ quality, onExit }: { quality: Quality; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HudData | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');
  const [result, setResult] = useState<RunResult | null>(null);
  const level = useMemo(() => LEVEL_1(), []);
  const isTouch = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, level, quality, {
      onHud: setHud,
      onEnd: (e) => {
        setResult(recordRun(e));
        setPhase('results');
      },
      onAutoPause: () => setPhase((p) => (p === 'playing' ? 'paused' : p)),
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [level, quality]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    if (phase === 'paused') e.pause();
    else if (phase === 'playing') e.resume();
  }, [phase]);

  const retry = useCallback(() => {
    engineRef.current?.restart();
    setResult(null);
    setHud(null);
    setPhase('playing');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
      else if ((e.code === 'Enter' || e.code === 'KeyR') && phase === 'results') retry();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, retry]);

  // Landscape-only on touch devices: pause if the phone is turned upright.
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
    const onChange = () => {
      if (mq.matches) setPhase((p) => (p === 'playing' ? 'paused' : p));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const getTouch = useCallback(() => engineRef.current?.input.touch, []);
  const countdown = hud ? hud.countdown : 3;
  const showGo = hud !== null && hud.countdown === 0 && hud.time < 0.7;

  return (
    <div className="game">
      <canvas ref={canvasRef} className="game-canvas" />

      {hud && (
        <div className="hud" aria-live="off">
          <div className="hud-progress"><i style={{ width: `${hud.progress * 100}%` }} /></div>
          <div className="hud-row">
            <div className="stat"><b>{Math.floor(hud.dist)}</b><span>m</span></div>
            <div className="stat"><b>{Math.round(hud.speed * 3.6)}</b><span>km/h</span></div>
            <div className="stat"><b>{hud.score.toLocaleString()}</b><span>score</span></div>
            <div className="stat"><b>{fmtTime(hud.time)}</b><span>time</span></div>
            <button className="pause-btn" aria-label="Pause" onClick={() => setPhase('paused')}>II</button>
          </div>
          <div className={`pulse ${hud.dashReady ? 'ready' : ''}`}>
            <span className="pulse-label">Pulse</span>
            <div className="pulse-bar">
              <i style={{ width: `${(hud.energy / ENERGY_MAX) * 100}%` }} />
              <em style={{ left: `${(DASH_COST / ENERGY_MAX) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {phase === 'playing' && countdown > 0 && (
        <div className="center-msg">
          <div className="count">{Math.ceil(countdown)}</div>
          {!isTouch && <p className="keys">A / D steer · Space jump · Shift slide · E pulse dash</p>}
        </div>
      )}
      {phase === 'playing' && showGo && <div className="center-msg"><div className="count go">Go</div></div>}

      {isTouch && phase === 'playing' && <TouchControls getTouch={getTouch} />}

      {phase === 'paused' && (
        <div className="overlay">
          <div className="card">
            <h2>Paused</h2>
            <div className="btn-col">
              <button className="btn" onClick={() => setPhase('playing')}>Resume</button>
              <button className="btn ghost" onClick={retry}>Restart run</button>
              <button className="btn ghost" onClick={onExit}>Main menu</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && result && (
        <div className="overlay">
          <div className="card">
            <h2 className={result.end.status === 'finished' ? 'win' : 'lose'}>
              {result.end.status === 'finished' ? 'Course complete' : result.end.reason === 'fell' ? 'You fell off the track' : 'You hit an obstacle'}
            </h2>
            <dl className="results">
              <div><dt>Distance</dt><dd>{Math.floor(result.end.dist)} m{result.newDist && <small> new best</small>}</dd></div>
              <div><dt>Score</dt><dd>{result.end.score.toLocaleString()}{result.newScore && <small> new best</small>}</dd></div>
              <div>
                <dt>Time</dt>
                <dd>{result.end.status === 'finished' ? fmtTime(result.end.time) : `${fmtTime(result.end.time)} (not finished)`}{result.newTime && <small> new best</small>}</dd>
              </div>
              <div><dt>Best time</dt><dd>{result.bests.bestTime === null ? 'Finish the course to set one' : fmtTime(result.bests.bestTime)}</dd></div>
              <div><dt>Best distance</dt><dd>{Math.floor(result.bests.bestDist)} m</dd></div>
            </dl>
            <div className="btn-row">
              <button className="btn" onClick={retry}>Retry</button>
              <button className="btn ghost" onClick={onExit}>Main menu</button>
            </div>
          </div>
        </div>
      )}

      <div className="rotate-notice"><p>Turn your phone sideways to play Pulse Rush.</p></div>
    </div>
  );
}
