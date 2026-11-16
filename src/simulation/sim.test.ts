import { describe, expect, it } from 'vitest';
import { DT, DASH_COST, ENERGY_MAX, TRACK_HALF_WIDTH } from './constants';
import { generateLevel } from './level';
import { createState, step } from './sim';
import { obstacleX } from './types';
import type { InputState, LevelDef, Obstacle, ObstacleKind, SimState } from './types';

const NONE: InputState = { move: 0, jump: false, slide: false, dash: false };

function ob(kind: ObstacleKind, z: number, o: Partial<Obstacle> = {}): Obstacle {
  return { id: 0, kind, z, depth: 0.4, x: 0, halfW: TRACK_HALF_WIDTH, y0: 0, y1: 1, amp: 0, freq: 0, phase: 0, ...o };
}
const level = (obstacles: Obstacle[], length = 200): LevelDef => ({ id: 't', name: 't', length, seed: 0, obstacles });

/** Run until `until` returns true or maxSeconds elapse. `input` may depend on state. */
function run(s: SimState, l: LevelDef, input: (s: SimState) => Partial<InputState>, until: (s: SimState) => boolean, maxSeconds = 20) {
  for (let i = 0; i < maxSeconds / DT && s.status === 'running' && !until(s); i++) step(s, { ...NONE, ...input(s) }, l);
  return s;
}

describe('movement', () => {
  it('runs forward and ramps speed', () => {
    const s = createState();
    const l = level([], 5000);
    run(s, l, () => ({}), (st) => st.time >= 5);
    expect(s.dist).toBeGreaterThan(80);
    expect(s.speed).toBeGreaterThan(16);
    expect(s.status).toBe('running');
  });

  it('jumps and lands back on the floor', () => {
    const s = createState();
    const l = level([]);
    step(s, { ...NONE, jump: true }, l);
    expect(s.grounded).toBe(false);
    run(s, l, () => ({}), (st) => st.grounded, 3);
    expect(s.grounded).toBe(true);
    expect(s.y).toBe(0);
  });

  it('fast-fall never tunnels through the floor', () => {
    const l = level([], 5000);
    for (let offset = 0; offset < 40; offset++) {
      const s = createState();
      step(s, { ...NONE, jump: true }, l);
      for (let i = 0; i < 20 + offset; i++) step(s, NONE, l);
      step(s, { ...NONE, slide: true }, l);
      run(s, l, () => ({}), (st) => st.grounded && st.y === 0, 2);
      expect(s.status).toBe('running');
      expect(s.y).toBe(0);
    }
  });

  it('moves laterally and falls off the track edge', () => {
    const s = createState();
    run(s, level([], 5000), () => ({ move: 1 }), () => false, 3);
    expect(s.status).toBe('crashed');
    expect(s.crash).toBe('fell');
  });
});

describe('obstacles', () => {
  it('crashes into a low block, clears it with a jump', () => {
    const l = level([ob('block', 30, { depth: 0.5, y1: 1 })]);
    const hit = run(createState(), l, () => ({}), () => false);
    expect(hit.crash).toBe('obstacle');
    const ok = run(createState(), l, (s) => ({ jump: s.dist >= 24 }), (s) => s.dist > 40);
    expect(ok.status).toBe('running');
  });

  it('beam: slide passes, standing crashes, jumping crashes', () => {
    const l = level([ob('beam', 30, { depth: 0.35, y0: 0.95, y1: 2.8 })]);
    expect(run(createState(), l, () => ({}), () => false).crash).toBe('obstacle');
    expect(run(createState(), l, (s) => ({ jump: s.dist >= 24 }), () => false).crash).toBe('obstacle');
    const ok = run(createState(), l, (s) => ({ slide: s.dist >= 26 }), (s) => s.dist > 40);
    expect(ok.status).toBe('running');
  });

  it('pulse dash phases through lasers but not solid blocks', () => {
    const wall = level([ob('wall', 30, { depth: 0.3, halfW: 1, y1: 3.2 })]);
    expect(run(createState(), wall, () => ({}), () => false).crash).toBe('obstacle');
    const ok = run(createState(), wall, (s) => ({ dash: s.dist >= 26 }), (s) => s.dist > 45);
    expect(ok.status).toBe('running');
    const block = level([ob('block', 30, { depth: 0.5, y1: 1 })]);
    expect(run(createState(), block, (s) => ({ dash: s.dist >= 26 }), () => false).crash).toBe('obstacle');
  });

  it('gap: running into it is a fall, jumping clears it', () => {
    const l = level([ob('gap', 30, { depth: 4 })]);
    expect(run(createState(), l, () => ({}), () => false).crash).toBe('fell');
    const ok = run(createState(), l, (s) => ({ jump: s.dist >= 24 }), (s) => s.dist > 45);
    expect(ok.status).toBe('running');
    expect(ok.grounded).toBe(true);
  });

  it('boost pad increases speed', () => {
    const l = level([ob('boost', 20, { depth: 2, halfW: 3, y1: 0.1 })], 5000);
    const s = createState();
    run(s, l, () => ({}), (st) => st.boostT > 0, 5);
    expect(s.boostT).toBeGreaterThan(0);
    step(s, NONE, l);
    expect(s.speed).toBeGreaterThan(16 * 1.25);
  });

  it('sweeper oscillates across the track over time', () => {
    const o = ob('sweeper', 30, { halfW: 0.45, y1: 3.2, amp: 2.3, freq: 2, phase: 0 });
    const xs = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2].map((t) => obstacleX(o, t));
    expect(Math.max(...xs)).toBeGreaterThan(1.5);
    expect(Math.min(...xs)).toBeLessThan(-1.5);
  });
});

describe('pulse resource', () => {
  it('dash spends energy and respects cooldown', () => {
    const l = level([], 5000);
    const s = createState();
    step(s, { ...NONE, dash: true }, l);
    expect(s.dashT).toBeGreaterThan(0);
    expect(s.energy).toBeLessThan(ENERGY_MAX - DASH_COST + 1);
    const before = s.energy;
    step(s, NONE, l);
    step(s, { ...NONE, dash: true }, l);
    expect(s.energy).toBeGreaterThanOrEqual(before - 0.01); // second press ignored while dashing
  });

  it('dash is refused with too little energy', () => {
    const s = createState();
    s.energy = DASH_COST - 1;
    step(s, { ...NONE, dash: true }, level([], 5000));
    expect(s.dashT).toBeLessThanOrEqual(0);
  });
});

describe('race state', () => {
  it('finishes at the end of the track', () => {
    const s = createState();
    run(s, level([], 100), () => ({}), () => false, 30);
    expect(s.status).toBe('finished');
  });

  it('is deterministic', () => {
    const l = generateLevel(7);
    const a = createState();
    const b = createState();
    const inp = (st: SimState) => ({ jump: Math.floor(st.time * 3) % 4 === 0, move: Math.sin(st.time) });
    run(a, l, inp, () => false, 6);
    run(b, l, inp, () => false, 6);
    expect(a).toEqual(b);
  });
});

describe('level generator', () => {
  it('is deterministic per seed and sorted', () => {
    const a = generateLevel(1337);
    expect(generateLevel(1337)).toEqual(a);
    expect(generateLevel(1338)).not.toEqual(a);
    for (let i = 1; i < a.obstacles.length; i++) expect(a.obstacles[i]!.z).toBeGreaterThanOrEqual(a.obstacles[i - 1]!.z);
    expect(a.obstacles.length).toBeGreaterThan(15);
  });

  it('keeps everything inside the course and gaps tile-aligned', () => {
    const l = generateLevel();
    for (const o of l.obstacles) {
      expect(o.z).toBeGreaterThan(40);
      expect(o.z).toBeLessThan(l.length);
      if (o.kind === 'gap') {
        expect((o.z - o.depth) % 4).toBeCloseTo(0, 6);
        expect((o.depth * 2) % 4).toBeCloseTo(0, 6);
      }
    }
  });

  it('uses every obstacle type', () => {
    const kinds = new Set(generateLevel().obstacles.map((o) => o.kind));
    for (const k of ['block', 'beam', 'wall', 'gap', 'boost', 'sweeper'] as const) expect(kinds.has(k)).toBe(true);
  });
});
