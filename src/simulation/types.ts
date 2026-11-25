export type ObstacleKind = 'block' | 'beam' | 'wall' | 'sweeper' | 'gap' | 'boost';

/** Obstacles a Pulse dash can phase through. Solid blocks and gaps are never skippable. */
export const LASER_KINDS: ReadonlySet<ObstacleKind> = new Set<ObstacleKind>(['beam', 'wall', 'sweeper']);

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  /** Centre distance along the track. */
  z: number;
  /** Half length along the track (also half-length of a gap). */
  depth: number;
  /** Lateral centre (for sweepers: the centre of the oscillation). */
  x: number;
  halfW: number;
  y0: number;
  y1: number;
  /** Sweeper motion: x(t) = x + amp * sin(freq * t + phase). */
  amp: number;
  freq: number;
  phase: number;
}

export interface LevelDef {
  id: string;
  name: string;
  length: number;
  seed: number;
  obstacles: Obstacle[];
  endless?: boolean;
  ensureUpTo?: (dist: number) => void;
}

/** Normalised input, fed by keyboard and touch alike. */
export interface InputState {
  /** -1 (left) .. 1 (right) */
  move: number;
  jump: boolean;
  slide: boolean;
  dash: boolean;
}

export type RunStatus = 'running' | 'crashed' | 'finished';
export type CrashReason = 'obstacle' | 'fell';

export interface SimState {
  time: number;
  dist: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  grounded: boolean;
  sliding: boolean;
  slideT: number;
  slideQueued: boolean;
  coyote: number;
  jumpBuf: number;
  dashT: number;
  dashCd: number;
  boostT: number;
  energy: number;
  score: number;
  cleared: number;
  nextObstacle: number;
  status: RunStatus;
  crash: CrashReason | null;
  prevJump: boolean;
  prevSlide: boolean;
  prevDash: boolean;
}

export function obstacleX(o: Obstacle, time: number): number {
  return o.kind === 'sweeper' ? o.x + o.amp * Math.sin(o.freq * time + o.phase) : o.x;
}
