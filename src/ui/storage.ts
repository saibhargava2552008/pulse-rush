import type { EndData } from '../engine/Engine';
import type { Quality } from '../engine/quality';

export interface Bests {
  bestTime: number | null;
  bestScore: number;
  bestDist: number;
}

const BESTS_KEY = 'pulse-rush:v1:bests:level-1';
const QUALITY_KEY = 'pulse-rush:v1:quality';

const EMPTY: Bests = { bestTime: null, bestScore: 0, bestDist: 0 };

export function loadBests(): Bests {
  try {
    const raw = localStorage.getItem(BESTS_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Bests>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export interface RunResult {
  end: EndData;
  bests: Bests;
  newTime: boolean;
  newScore: boolean;
  newDist: boolean;
}

export function recordRun(end: EndData): RunResult {
  const b = loadBests();
  const newTime = end.status === 'finished' && (b.bestTime === null || end.time < b.bestTime);
  const newScore = end.score > b.bestScore;
  const newDist = end.dist > b.bestDist;
  const bests: Bests = {
    bestTime: newTime ? end.time : b.bestTime,
    bestScore: newScore ? end.score : b.bestScore,
    bestDist: newDist ? end.dist : b.bestDist,
  };
  try {
    localStorage.setItem(BESTS_KEY, JSON.stringify(bests));
  } catch {
    /* storage unavailable (private mode): bests just won't persist */
  }
  return { end, bests, newTime, newScore, newDist };
}

export function loadQuality(): Quality {
  try {
    const v = localStorage.getItem(QUALITY_KEY);
    if (v === 'low' || v === 'medium' || v === 'high') return v;
  } catch {
    /* ignore */
  }
  return window.matchMedia('(pointer: coarse)').matches ? 'low' : 'medium';
}

export function saveQuality(q: Quality): void {
  try {
    localStorage.setItem(QUALITY_KEY, q);
  } catch {
    /* ignore */
  }
}
