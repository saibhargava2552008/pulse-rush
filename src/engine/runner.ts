import * as THREE from 'three';

export interface RunnerFrame {
  grounded: boolean;
  sliding: boolean;
  dashing: boolean;
  speed: number;
  time: number;
}

const SUIT = 0x1d2250;
const SUIT_LIGHT = 0x2b3a8f;
const CYAN = 0x2bf0ff;
const AMBER = 0xff7a1a;

/** Procedural futuristic runner. Faces -Z; origin at the feet. */
export class Runner {
  readonly root = new THREE.Group();
  readonly light: THREE.PointLight;
  private body = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private core: THREE.Mesh;
  private trail: THREE.Mesh;
  private trailMat: THREE.MeshBasicMaterial;
  private geoms: THREE.BufferGeometry[] = [];
  private mats: THREE.Material[] = [];
  private pose = { bodyY: 0.95, bodyRot: -0.18, legL: 0, legR: 0, armL: 0, armR: 0 };
  private squash = 0;
  private readonly baseScale = 0.92;

  constructor() {
    const suit = this.std(SUIT, 0x0a0c24);
    const suit2 = this.std(SUIT_LIGHT, 0x101a50);
    const cyan = this.basic(CYAN);
    const amber = this.basic(AMBER);
    const visorMat = this.basic(CYAN);

    // torso, chest light, pulse core
    this.add(this.body, new THREE.BoxGeometry(0.5, 0.62, 0.3), suit2, 0, 0.36, 0);
    this.add(this.body, new THREE.BoxGeometry(0.3, 0.05, 0.02), cyan, 0, 0.5, -0.16);
    this.core = this.add(this.body, new THREE.BoxGeometry(0.26, 0.3, 0.12), cyan, 0, 0.4, 0.2);
    // head + visor
    this.add(this.body, new THREE.SphereGeometry(0.16, 14, 10), suit, 0, 0.78, 0);
    this.add(this.body, new THREE.BoxGeometry(0.22, 0.07, 0.06), visorMat, 0, 0.8, -0.13);
    // shoulder pads (controlled amber accent)
    this.add(this.body, new THREE.BoxGeometry(0.2, 0.12, 0.26), amber, -0.34, 0.66, 0);
    this.add(this.body, new THREE.BoxGeometry(0.2, 0.12, 0.26), amber, 0.34, 0.66, 0);

    for (const [arm, sx] of [[this.armL, -1], [this.armR, 1]] as const) {
      arm.position.set(sx * 0.34, 0.6, 0);
      this.add(arm, new THREE.BoxGeometry(0.13, 0.52, 0.13), suit, 0, -0.26, 0);
      this.add(arm, new THREE.BoxGeometry(0.15, 0.1, 0.15), cyan, 0, -0.55, 0);
      this.body.add(arm);
    }
    for (const [leg, sx] of [[this.legL, -1], [this.legR, 1]] as const) {
      leg.position.set(sx * 0.14, 0.95, 0);
      this.add(leg, new THREE.BoxGeometry(0.18, 0.92, 0.2), suit, 0, -0.46, 0);
      this.add(leg, new THREE.BoxGeometry(0.2, 0.09, 0.22), cyan, 0, -0.84, 0);
      this.root.add(leg);
    }

    this.trailMat = new THREE.MeshBasicMaterial({
      color: CYAN, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.mats.push(this.trailMat);
    const tg = new THREE.BoxGeometry(0.6, 0.9, 3);
    this.geoms.push(tg);
    this.trail = new THREE.Mesh(tg, this.trailMat);
    this.trail.position.set(0, 0.9, 2);
    this.trail.visible = false;

    this.light = new THREE.PointLight(CYAN, 6, 9, 2);
    this.light.position.set(0, 1.2, 1.2);

    this.root.add(this.body, this.trail, this.light);
    this.root.scale.setScalar(this.baseScale);
  }

  private std(color: number, emissive: number): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({ color, emissive, roughness: 0.45, metalness: 0.5 });
    this.mats.push(m);
    return m;
  }
  private basic(color: number): THREE.MeshBasicMaterial {
    const m = new THREE.MeshBasicMaterial({ color });
    this.mats.push(m);
    return m;
  }
  private add(parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
    this.geoms.push(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  /** Landing feedback: a brief squash. */
  land(): void {
    this.squash = 1;
  }

  update(dt: number, f: RunnerFrame): void {
    const phase = f.time * f.speed * 0.55;
    const t = { bodyY: 0.95, bodyRot: -0.18, legL: 0, legR: 0, armL: 0, armR: 0 };
    if (f.dashing) {
      t.bodyY = 0.9; t.bodyRot = -0.75; t.legL = -0.7; t.legR = -0.2; t.armL = -1.4; t.armR = -1.4;
    } else if (f.sliding) {
      t.bodyY = 0.42; t.bodyRot = 1.15; t.legL = 1.3; t.legR = 1.3; t.armL = 1.2; t.armR = 1.2;
    } else if (!f.grounded) {
      t.bodyY = 1.0; t.bodyRot = -0.1; t.legL = -0.9; t.legR = 0.6; t.armL = 1.6; t.armR = -0.3;
    } else {
      const s = Math.sin(phase);
      t.bodyY = 0.95 + Math.abs(Math.cos(phase)) * 0.05;
      t.legL = s * 0.95; t.legR = -s * 0.95; t.armL = -s * 0.8; t.armR = s * 0.8;
    }
    const k = 1 - Math.exp(-18 * dt);
    const p = this.pose;
    p.bodyY += (t.bodyY - p.bodyY) * k;
    p.bodyRot += (t.bodyRot - p.bodyRot) * k;
    p.legL += (t.legL - p.legL) * k;
    p.legR += (t.legR - p.legR) * k;
    p.armL += (t.armL - p.armL) * k;
    p.armR += (t.armR - p.armR) * k;

    this.body.position.y = p.bodyY;
    this.body.rotation.x = p.bodyRot;
    this.legL.position.y = this.legR.position.y = p.bodyY;
    this.legL.rotation.x = p.legL;
    this.legR.rotation.x = p.legR;
    // arm targets are absolute; the arms are children of the leaning body
    this.armL.rotation.x = p.armL - p.bodyRot;
    this.armR.rotation.x = p.armR - p.bodyRot;

    this.squash *= Math.exp(-12 * dt);
    this.root.scale.set(this.baseScale * (1 + 0.15 * this.squash), this.baseScale * (1 - 0.25 * this.squash), this.baseScale);

    this.trail.visible = f.dashing;
    const pulse = 1 + (f.dashing ? 0.6 : 0.1 * Math.sin(f.time * 8));
    this.core.scale.setScalar(pulse);
  }

  dispose(): void {
    for (const g of this.geoms) g.dispose();
    for (const m of this.mats) m.dispose();
  }
}
