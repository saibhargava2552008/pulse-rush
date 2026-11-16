import * as THREE from 'three';
import { DASH_COST, DT } from '../simulation/constants';
import { createState, step } from '../simulation/sim';
import type { CrashReason, LevelDef, SimState } from '../simulation/types';
import { InputHub } from './input';
import { QUALITY } from './quality';
import type { Quality } from './quality';
import { Runner } from './runner';
import { buildWorld } from './world';
import type { World } from './world';

export interface HudData {
  dist: number;
  speed: number;
  score: number;
  time: number;
  energy: number;
  dashReady: boolean;
  progress: number;
  length: number;
  countdown: number;
}

export interface EndData {
  status: 'finished' | 'crashed';
  reason: CrashReason | null;
  dist: number;
  score: number;
  time: number;
  progress: number;
}

export interface EngineCallbacks {
  onHud: (h: HudData) => void;
  onEnd: (e: EndData) => void;
  /** The tab was hidden: the UI should show its pause screen. */
  onAutoPause?: () => void;
}

interface Snap {
  x: number;
  y: number;
  dist: number;
  time: number;
}

const COUNTDOWN = 3;
const END_DELAY = 0.8;

/**
 * Rendering + game loop. Runs the pure simulation at a fixed 60 Hz and interpolates
 * the render between ticks. React is only told about the HUD ~10 times a second.
 */
export class Engine {
  readonly input = new InputHub();
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(66, 1, 0.1, 260);
  private world: World;
  private runner = new Runner();
  private state: SimState = createState();
  private prev: Snap = { x: 0, y: 0, dist: 0, time: 0 };
  private cur: Snap = { x: 0, y: 0, dist: 0, time: 0 };
  private wasGrounded = true;
  private acc = 0;
  private last = 0;
  private raf = 0;
  private paused = false;
  private countdown = COUNTDOWN;
  private endTimer = END_DELAY;
  private endSent = false;
  private hudAcc = 0;
  private shake = 0;
  private camX = 0;
  private fov = 66;
  private resizeObs: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private level: LevelDef,
    quality: Quality,
    private cb: EngineCallbacks,
  ) {
    const q = QUALITY[quality];
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: q.antialias, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.pixelRatioCap));
    this.world = buildWorld(this.scene, level, q);
    this.scene.add(this.runner.root);
    this.runner.light.visible = q.runnerLight;

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  start(): void {
    this.input.attach();
    this.reset();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  restart(): void {
    this.input.clear();
    this.reset();
  }

  pause(): void {
    this.paused = true;
    this.input.clear();
  }

  resume(): void {
    this.paused = false;
    this.last = performance.now();
    this.input.clear();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resizeObs.disconnect();
    this.input.detach();
    this.world.dispose();
    this.runner.dispose();
    this.renderer.dispose();
  }

  private reset(): void {
    this.state = createState();
    this.snap(this.prev);
    this.snap(this.cur);
    this.wasGrounded = true;
    this.acc = 0;
    this.countdown = COUNTDOWN;
    this.endTimer = END_DELAY;
    this.endSent = false;
    this.shake = 0;
    this.camX = 0;
    this.paused = false;
    this.emitHud();
  }

  private snap(s: Snap): void {
    s.x = this.state.x;
    s.y = this.state.y;
    s.dist = this.state.dist;
    s.time = this.state.time;
  }

  private onVisibility = (): void => {
    if (document.hidden) this.cb.onAutoPause?.();
    else this.last = performance.now();
  };

  private resize(): void {
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (!this.paused) this.advance(dt);
    this.render(this.paused ? 0 : dt);
  };

  private advance(dt: number): void {
    const s = this.state;
    if (s.status !== 'running') {
      this.endTimer -= dt;
      if (this.endTimer <= 0 && !this.endSent) {
        this.endSent = true;
        this.emitHud();
        this.cb.onEnd({
          status: s.status === 'finished' ? 'finished' : 'crashed',
          reason: s.crash,
          dist: s.dist,
          score: s.score,
          time: s.time,
          progress: Math.min(1, s.dist / this.level.length),
        });
      }
      return;
    }
    if (this.countdown > 0) {
      this.countdown -= dt;
      this.hudTick(dt);
      return;
    }
    this.acc += dt;
    while (this.acc >= DT && s.status === 'running') {
      this.prev.x = this.cur.x;
      this.prev.y = this.cur.y;
      this.prev.dist = this.cur.dist;
      this.prev.time = this.cur.time;
      step(s, this.input.read(), this.level);
      this.snap(this.cur);
      this.acc -= DT;
      if (!this.wasGrounded && s.grounded) {
        this.runner.land();
        this.shake = Math.max(this.shake, 0.05);
      }
      this.wasGrounded = s.grounded;
      if (s.crash !== null) this.shake = 0.7;
    }
    this.hudTick(dt);
  }

  private hudTick(dt: number): void {
    this.hudAcc += dt;
    if (this.hudAcc >= 0.1) {
      this.hudAcc = 0;
      this.emitHud();
    }
  }

  private emitHud(): void {
    const s = this.state;
    this.cb.onHud({
      dist: s.dist,
      speed: s.speed,
      score: s.score,
      time: s.time,
      energy: s.energy,
      dashReady: s.energy >= DASH_COST && s.dashCd <= 0,
      progress: Math.min(1, s.dist / this.level.length),
      length: this.level.length,
      countdown: Math.max(0, this.countdown),
    });
  }

  private render(dt: number): void {
    const s = this.state;
    const a = s.status === 'running' && this.countdown <= 0 ? Math.min(1, this.acc / DT) : 1;
    const x = this.prev.x + (this.cur.x - this.prev.x) * a;
    const y = this.prev.y + (this.cur.y - this.prev.y) * a;
    const dist = this.prev.dist + (this.cur.dist - this.prev.dist) * a;
    const time = this.prev.time + (this.cur.time - this.prev.time) * a;

    this.runner.root.position.set(x, y, -dist);
    this.runner.update(dt, {
      grounded: s.grounded,
      sliding: s.sliding,
      dashing: s.dashT > 0 && s.status === 'running',
      speed: s.speed,
      time: this.last / 1000,
    });
    this.world.update(time);

    // Third-person chase camera
    const dashing = s.dashT > 0;
    const targetFov = 66 + (s.speed - 16) * 0.5 + (dashing ? 8 : 0);
    this.fov += (targetFov - this.fov) * (1 - Math.exp(-6 * dt));
    if (Math.abs(this.camera.fov - this.fov) > 0.05) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
    this.camX += (x * 0.6 - this.camX) * (1 - Math.exp(-9 * dt));
    this.shake *= Math.exp(-6 * dt);
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    this.camera.position.set(this.camX + sx, 3.1 + y * 0.45 + sy, -dist + 7.5);
    this.camera.lookAt(x * 0.8, 1.2 + y * 0.3, -dist - 14);

    this.renderer.render(this.scene, this.camera);
  }
}
