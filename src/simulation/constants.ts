// All gameplay tuning lives here. Units: metres, seconds.
export const DT = 1 / 60;

export const TRACK_HALF_WIDTH = 3.2;
export const PLAYER_HALF_WIDTH = 0.3;
export const PLAYER_HALF_DEPTH = 0.3;
export const STAND_HEIGHT = 1.7;
export const SLIDE_HEIGHT = 0.7;

export const GRAVITY = -28;
export const JUMP_VELOCITY = 10.5;
export const FAST_FALL_VELOCITY = -16;
export const COYOTE_TIME = 0.1;
export const JUMP_BUFFER = 0.12;
/** A player who was already this far below the floor (e.g. fell into a gap) can't snap back up. */
export const MIN_LAND_Y = -0.25;
export const FALL_DEATH_Y = -6;

export const LATERAL_SPEED = 9.5;
export const LATERAL_ACCEL = 70;

export const BASE_SPEED = 16;
export const MAX_SPEED = 30;
export const SPEED_PER_METER = 0.014;

export const SLIDE_TIME = 0.75;

// Pulse dash: spend energy for a short surge that phases through lasers.
export const ENERGY_MAX = 100;
export const ENERGY_REGEN = 13;
export const ENERGY_PER_CLEAR = 8;
export const DASH_COST = 40;
export const DASH_TIME = 0.28;
export const DASH_COOLDOWN = 0.7;
export const DASH_SPEED_MULT = 1.8;

export const BOOST_TIME = 1.4;
export const BOOST_SPEED_MULT = 1.3;

export const SCORE_PER_METER = 10;
export const SCORE_PER_CLEAR = 50;
