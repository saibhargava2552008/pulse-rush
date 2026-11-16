import { TRACK_HALF_WIDTH as HALF } from './constants';
import type { LevelDef, Obstacle, ObstacleKind } from './types';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draft = Omit<Obstacle, 'id'>;
interface Ctx {
  rng: () => number;
  p: number; // progress 0..1
  out: Draft[];
}

function mk(kind: ObstacleKind, z: number, o: Partial<Draft>): Draft {
  return { kind, z, depth: 0.4, x: 0, halfW: HALF, y0: 0, y1: 1, amp: 0, freq: 0, phase: 0, ...o };
}

// Each pattern pushes obstacles starting at z and returns the length it occupies.
const jumpBlock = (c: Ctx, z: number) => {
  c.out.push(mk('block', z, { depth: 0.5, y0: 0, y1: 1.0 }));
  return 4;
};

const tallSideWall = (c: Ctx, z: number) => {
  const side = c.rng() < 0.5 ? -1 : 1;
  const w = 3.0 + c.p * 0.6;
  c.out.push(mk('block', z, { depth: 0.6, x: side * (HALF - w / 2), halfW: w / 2, y0: 0, y1: 2.4 }));
  return 4;
};

const slideBeam = (c: Ctx, z: number) => {
  c.out.push(mk('beam', z, { depth: 0.35, y0: 0.95, y1: 2.8 }));
  return 3;
};

const laserGate = (c: Ctx, z: number) => {
  const open = 2.6 - c.p * 1.0;
  const lim = HALF - open / 2 - 0.2;
  const centre = (c.rng() * 2 - 1) * lim;
  const l0 = -HALF;
  const l1 = centre - open / 2;
  const r0 = centre + open / 2;
  const r1 = HALF;
  if (l1 - l0 > 0.1) c.out.push(mk('wall', z, { depth: 0.3, x: (l0 + l1) / 2, halfW: (l1 - l0) / 2, y0: 0, y1: 3.2 }));
  if (r1 - r0 > 0.1) c.out.push(mk('wall', z, { depth: 0.3, x: (r0 + r1) / 2, halfW: (r1 - r0) / 2, y0: 0, y1: 3.2 }));
  return 3;
};

const sweeper = (c: Ctx, z: number) => {
  c.out.push(
    mk('sweeper', z, { depth: 0.3, halfW: 0.45, y0: 0, y1: 3.2, amp: HALF - 0.9, freq: 1.4 + c.p * 1.2, phase: c.rng() * Math.PI * 2 }),
  );
  return 3;
};

/** Gap edges are snapped to the 4 m floor tiles the engine draws. */
const gap = (c: Ctx, z: number) => {
  const start = Math.ceil(z / 4) * 4;
  const k = c.p > 0.6 && c.rng() < 0.6 ? 3 : 2;
  const len = 4 * k;
  c.out.push(mk('gap', start + len / 2, { depth: len / 2, x: 0, halfW: HALF, y0: 0, y1: 0 }));
  return start + len - z;
};

const boostPad = (c: Ctx, z: number) => {
  c.out.push(mk('boost', z, { depth: 2, x: (c.rng() * 2 - 1) * 1.8, halfW: 1.2, y0: 0, y1: 0.1 }));
  return 4;
};

const comboBlockBeam = (c: Ctx, z: number) => {
  jumpBlock(c, z);
  slideBeam(c, z + 14);
  return 17;
};

const comboGateSweeper = (c: Ctx, z: number) => {
  laserGate(c, z);
  sweeper(c, z + 14);
  return 17;
};

const comboWallGap = (c: Ctx, z: number) => {
  tallSideWall(c, z);
  return 10 + gap(c, z + 10);
};

const boostGap = (c: Ctx, z: number) => {
  boostPad(c, z);
  return 16 + gap(c, z + 16);
};

interface Entry {
  from: number;
  weight: number;
  fn: (c: Ctx, z: number) => number;
}

const POOL: Entry[] = [
  { from: 0, weight: 3, fn: jumpBlock },
  { from: 0.05, weight: 3, fn: tallSideWall },
  { from: 0.12, weight: 3, fn: slideBeam },
  { from: 0.15, weight: 2, fn: laserGate },
  { from: 0.22, weight: 3, fn: gap },
  { from: 0.3, weight: 1, fn: boostGap },
  { from: 0.38, weight: 2, fn: sweeper },
  { from: 0.5, weight: 2, fn: comboBlockBeam },
  { from: 0.58, weight: 2, fn: comboGateSweeper },
  { from: 0.66, weight: 2, fn: comboWallGap },
];

/** Deterministic level generator. The same seed always yields the same course. */
export function generateLevel(seed = 1337, length = 800, name = 'Neon City — Run 01'): LevelDef {
  const rng = mulberry32(seed);
  const out: Draft[] = [];
  const intro = [jumpBlock, tallSideWall, slideBeam, boostPad];
  let z = 70;
  let n = 0;
  while (z < length - 60) {
    const p = z / length;
    const c: Ctx = { rng, p, out };
    let used: number;
    if (n < intro.length) {
      used = intro[n]!(c, z);
    } else {
      const avail = POOL.filter((e) => e.from <= p);
      const total = avail.reduce((a, e) => a + e.weight, 0);
      let r = rng() * total;
      let pick = avail[0]!;
      for (const e of avail) {
        r -= e.weight;
        if (r <= 0) {
          pick = e;
          break;
        }
      }
      used = pick.fn(c, z);
    }
    z += used + 36 - 16 * p;
    n++;
  }
  out.sort((a, b) => a.z - b.z);
  return { id: `level-${seed}`, name, length, seed, obstacles: out.map((o, i) => ({ ...o, id: i })) };
}

export const LEVEL_1 = (): LevelDef => generateLevel();
