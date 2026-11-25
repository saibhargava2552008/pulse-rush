import {
  BASE_SPEED, BOOST_SPEED_MULT, BOOST_TIME, COYOTE_TIME, DASH_COOLDOWN, DASH_COST, DASH_SPEED_MULT, DASH_TIME,
  DT, ENERGY_MAX, ENERGY_PER_CLEAR, ENERGY_REGEN, FALL_DEATH_Y, FAST_FALL_VELOCITY, GRAVITY, JUMP_BUFFER,
  JUMP_VELOCITY, LATERAL_ACCEL, LATERAL_SPEED, MAX_SPEED, MIN_LAND_Y, PLAYER_HALF_DEPTH, PLAYER_HALF_WIDTH,
  SCORE_PER_CLEAR, SCORE_PER_METER, SLIDE_HEIGHT, SLIDE_TIME, SPEED_PER_METER, STAND_HEIGHT, TRACK_HALF_WIDTH,
} from './constants';
import { LASER_KINDS, obstacleX } from './types';
import type { InputState, LevelDef, SimState } from './types';

export function createState(): SimState {
  return {
    time: 0, dist: 0, x: 0, y: 0, vx: 0, vy: 0, speed: BASE_SPEED,
    grounded: true, sliding: false, slideT: 0, slideQueued: false,
    coyote: COYOTE_TIME, jumpBuf: 0, dashT: 0, dashCd: 0, boostT: 0,
    energy: ENERGY_MAX, score: 0, cleared: 0, nextObstacle: 0,
    status: 'running', crash: null, prevJump: false, prevSlide: false, prevDash: false,
  };
}

export function playerHeight(s: SimState): number {
  return s.sliding ? SLIDE_HEIGHT : STAND_HEIGHT;
}

function hasFloor(level: LevelDef, dist: number, x: number): boolean {
  if (Math.abs(x) > TRACK_HALF_WIDTH + 0.1) return false;
  for (const o of level.obstacles) {
    if (o.kind === 'gap' && Math.abs(dist - o.z) < o.depth) return false;
    if (o.z - o.depth > dist + 1) break;
  }
  return true;
}

function startSlide(s: SimState): void {
  s.sliding = true;
  s.slideT = SLIDE_TIME;
  s.slideQueued = false;
}

/**
 * Advance the simulation by one fixed step. Mutates `s` in place (no allocation per tick).
 * Pure TypeScript: no DOM, no rendering, no timers.
 */
export function step(s: SimState, input: InputState, level: LevelDef, dt: number = DT): void {
  if (s.status !== 'running') return;
  s.time += dt;

  const jumpPressed = input.jump && !s.prevJump;
  const slidePressed = input.slide && !s.prevSlide;
  const dashPressed = input.dash && !s.prevDash;
  s.prevJump = input.jump;
  s.prevSlide = input.slide;
  s.prevDash = input.dash;

  // Timers
  s.coyote = s.grounded ? COYOTE_TIME : s.coyote - dt;
  s.jumpBuf = jumpPressed ? JUMP_BUFFER : s.jumpBuf - dt;
  s.dashT -= dt;
  s.dashCd -= dt;
  s.boostT -= dt;
  if (s.sliding) {
    s.slideT -= dt;
    if (s.slideT <= 0) s.sliding = false;
  }

  // Slide / fast-fall
  if (slidePressed) {
    if (s.grounded) startSlide(s);
    else {
      s.vy = Math.min(s.vy, FAST_FALL_VELOCITY);
      s.slideQueued = true;
    }
  }

  // Jump (with buffer + coyote time)
  if (s.jumpBuf > 0 && s.coyote > 0) {
    s.vy = JUMP_VELOCITY;
    s.grounded = false;
    s.coyote = 0;
    s.jumpBuf = 0;
    s.sliding = false;
    s.slideT = 0;
    s.slideQueued = false;
  }

  // Pulse dash
  if (dashPressed && s.dashCd <= 0 && s.dashT <= 0 && s.energy >= DASH_COST) {
    s.dashT = DASH_TIME;
    s.dashCd = DASH_COOLDOWN;
    s.energy -= DASH_COST;
  }
  if (s.dashT <= 0) s.energy = Math.min(ENERGY_MAX, s.energy + ENERGY_REGEN * dt);

  // Forward speed
  const base = Math.min(MAX_SPEED, BASE_SPEED + s.dist * SPEED_PER_METER);
  s.speed = base * (s.dashT > 0 ? DASH_SPEED_MULT : 1) * (s.boostT > 0 ? BOOST_SPEED_MULT : 1);
  s.dist += s.speed * dt;

  // Lateral movement
  const move = Math.max(-1, Math.min(1, input.move));
  const target = move * LATERAL_SPEED;
  const dv = LATERAL_ACCEL * dt;
  s.vx += Math.max(-dv, Math.min(dv, target - s.vx));
  s.x += s.vx * dt;

  // Vertical movement + floor
  const prevY = s.y;
  s.vy += GRAVITY * dt;
  s.y += s.vy * dt;
  // Judge landing by the height *before* this tick, so fast-falling can't tunnel through the floor.
  if (hasFloor(level, s.dist, s.x) && s.y <= 0 && prevY > MIN_LAND_Y && s.vy <= 0) {
    s.y = 0;
    s.vy = 0;
    s.grounded = true;
    if (s.slideQueued) startSlide(s);
  } else {
    s.grounded = false;
  }
  if (s.y < FALL_DEATH_Y) {
    s.status = 'crashed';
    s.crash = 'fell';
    return;
  }

  // Obstacles
  const h = playerHeight(s);
  const obs = level.obstacles;
  const startIdx = Math.max(0, s.nextObstacle - 2);
  for (let i = startIdx; i < obs.length; i++) {
    const o = obs[i]!;
    if (o.z - o.depth > s.dist + PLAYER_HALF_DEPTH + 1) break;
    if (o.kind === 'gap') continue;
    if (Math.abs(s.dist - o.z) >= PLAYER_HALF_DEPTH + o.depth) continue;
    if (Math.abs(s.x - obstacleX(o, s.time)) >= PLAYER_HALF_WIDTH + o.halfW) continue;
    if (o.kind === 'boost') {
      if (s.grounded) s.boostT = BOOST_TIME;
      continue;
    }
    if (s.y >= o.y1 || s.y + h <= o.y0) continue;
    if (s.dashT > 0 && LASER_KINDS.has(o.kind)) continue; // Pulse phases through lasers
    s.status = 'crashed';
    s.crash = 'obstacle';
    return;
  }

  // Scoring: obstacles fully passed
  while (s.nextObstacle < obs.length) {
    const o = obs[s.nextObstacle]!;
    if (o.z + o.depth + PLAYER_HALF_DEPTH >= s.dist) break;
    if (o.kind !== 'boost') {
      s.cleared++;
      s.energy = Math.min(ENERGY_MAX, s.energy + ENERGY_PER_CLEAR);
    }
    s.nextObstacle++;
  }
  s.score = Math.floor(s.dist * SCORE_PER_METER) + s.cleared * SCORE_PER_CLEAR;

  if (!level.endless && s.dist >= level.length) s.status = 'finished';
}
