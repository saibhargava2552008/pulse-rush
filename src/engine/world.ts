import * as THREE from 'three';
import { TRACK_HALF_WIDTH as HALF } from '../simulation/constants';
import { mulberry32 } from '../simulation/level';
import { obstacleX } from '../simulation/types';
import type { LevelDef, Obstacle } from '../simulation/types';
import type { QualityProfile } from './quality';

const TILE = 4;
const TILE_COUNT = 80; // 320 m active floor buffer
const SPAN_CITY = 320; // 320 m continuous skyline cycle
const CYAN = 0x2bf0ff;
const HOT = 0xff6a1a;

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export interface World {
  group: THREE.Group;
  /** Moves animated obstacles to their position at sim time `t`, and updates streaming world relative to player distance. */
  update(t: number, curDist?: number): void;
  dispose(): void;
}

interface BuildingInfo {
  x: number;
  w: number;
  h: number;
  d: number;
  relZ: number;
}

export function buildWorld(scene: THREE.Scene, level: LevelDef, q: QualityProfile): World {
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);
  const movers: { obj: THREE.Object3D; o: Obstacle }[] = [];
  const activeMeshes = new Map<number, THREE.Group>();
  const rng = mulberry32(level.seed ^ 0x9e3779b9);
  const m4 = new THREE.Matrix4();
  const qIdent = new THREE.Quaternion();

  // ---- sky + fog ----
  const sky = track(
    canvasTex(2, 256, (g) => {
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#04020f');
      grad.addColorStop(0.55, '#150a3a');
      grad.addColorStop(0.85, '#3a1466');
      grad.addColorStop(1, '#b8461e');
      g.fillStyle = grad;
      g.fillRect(0, 0, 2, 256);
    }),
  );
  scene.background = sky;
  scene.fog = new THREE.Fog(0x1a0b3a, 30, q.fogFar);

  // ---- shared geometry / materials ----
  const box = track(new THREE.BoxGeometry(1, 1, 1));
  const dark = track(new THREE.MeshStandardMaterial({ color: 0x1a1440, roughness: 0.5, metalness: 0.6, emissive: 0x120a30 }));
  const hot = track(new THREE.MeshBasicMaterial({ color: HOT }));
  const cyanBasic = track(new THREE.MeshBasicMaterial({ color: CYAN }));
  const curtain = track(
    new THREE.MeshBasicMaterial({
      color: 0xff5a14, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    }),
  );

  const part = (parent: THREE.Object3D, mat: THREE.Material, sx: number, sy: number, sz: number, x: number, y: number, z = 0): void => {
    const m = new THREE.Mesh(box, mat);
    m.scale.set(sx, sy, sz);
    m.position.set(x, y, z);
    parent.add(m);
  };

  // ---- floor tiles & rails (ring buffer instanced) ----
  const gridTex = track(
    canvasTex(256, 160, (g) => {
      g.fillStyle = '#0a0e2c';
      g.fillRect(0, 0, 256, 160);
      const grad = g.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, 'rgba(47,107,255,0.25)');
      grad.addColorStop(0.5, 'rgba(47,107,255,0)');
      grad.addColorStop(1, 'rgba(47,107,255,0.25)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 160);
      g.strokeStyle = '#2bf0ff';
      g.lineWidth = 5;
      g.strokeRect(2, 2, 252, 156);
      g.strokeStyle = 'rgba(139,77,255,0.7)';
      g.lineWidth = 3;
      g.setLineDash([14, 12]);
      for (const x of [256 / 3, (256 / 3) * 2]) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 160);
        g.stroke();
      }
    }),
  );
  const floorMat = track(
    new THREE.MeshStandardMaterial({
      map: gridTex, emissive: 0xffffff, emissiveMap: gridTex, emissiveIntensity: 0.9, roughness: 0.6, metalness: 0.3,
    }),
  );
  const tileGeo = track(new THREE.BoxGeometry(HALF * 2, 0.4, TILE - 0.04));
  const floor = new THREE.InstancedMesh(tileGeo, floorMat, TILE_COUNT);
  const railGeo = track(new THREE.BoxGeometry(0.2, 0.3, TILE - 0.04));
  const rails = new THREE.InstancedMesh(railGeo, cyanBasic, TILE_COUNT * 2);
  floor.frustumCulled = false;
  rails.frustumCulled = false;
  group.add(floor, rails);

  // ---- skyline (instanced, wrapped along continuous cycle) ----
  const winTex = track(
    canvasTex(64, 128, (g) => {
      g.fillStyle = '#0b0820';
      g.fillRect(0, 0, 64, 128);
      for (let y = 4; y < 128; y += 8) {
        for (let x = 4; x < 64; x += 8) {
          if (Math.random() < 0.45) {
            g.fillStyle = Math.random() < 0.2 ? '#ffb070' : '#bfefff';
            g.fillRect(x, y, 4, 4);
          }
        }
      }
    }),
  );
  const cityMat = track(new THREE.MeshBasicMaterial({ map: winTex }));
  const city = new THREE.InstancedMesh(box, cityMat, q.skyline);
  const tints = [0x2bf0ff, 0x2f6bff, 0x8b4dff, 0x8b4dff, 0x2f6bff, 0xff7a1a].map((c) => new THREE.Color(c));
  const col = new THREE.Color();
  const buildings: BuildingInfo[] = [];

  for (let n = 0; n < q.skyline; n++) {
    const side = n % 2 === 0 ? -1 : 1;
    const w = 6 + rng() * 10;
    const d = 6 + rng() * 10;
    const h = 25 + rng() * 75;
    const x = side * (14 + rng() * 55);
    const relZ = 30 + (n / q.skyline) * SPAN_CITY + rng() * 8;
    buildings.push({ x, w, h, d, relZ });
    col.copy(tints[Math.floor(rng() * tints.length)]!).multiplyScalar(0.55 + rng() * 0.45);
    city.setColorAt(n, col);
  }
  if (city.instanceColor) city.instanceColor.needsUpdate = true;
  city.frustumCulled = false;
  group.add(city);

  // ---- obstacles builder resources ----
  const chevron = track(
    canvasTex(64, 128, (g) => {
      g.clearRect(0, 0, 64, 128);
      g.strokeStyle = '#2bf0ff';
      g.lineWidth = 9;
      g.lineJoin = 'miter';
      for (const y of [30, 70, 110]) {
        g.beginPath();
        g.moveTo(8, y + 20);
        g.lineTo(32, y - 4);
        g.lineTo(56, y + 20);
        g.stroke();
      }
    }),
  );
  const boostMat = track(new THREE.MeshBasicMaterial({ map: chevron, transparent: true, depthWrite: false }));
  const padBase = track(new THREE.MeshBasicMaterial({ color: 0x0b2a4a, transparent: true, opacity: 0.8 }));
  const planeGeo = track(new THREE.PlaneGeometry(1, 1));

  const laser = (g: THREE.Group, o: Obstacle, posts: THREE.Material): void => {
    const h = o.y1 - o.y0;
    part(g, curtain, o.halfW * 2, h, 0.06, 0, (o.y0 + o.y1) / 2);
    part(g, hot, o.halfW * 2, 0.1, 0.12, 0, o.y0 + 0.05);
    part(g, hot, o.halfW * 2, 0.08, 0.12, 0, o.y1 - 0.04);
    part(g, posts, 0.22, o.y1, 0.28, -o.halfW, o.y1 / 2);
    part(g, posts, 0.22, o.y1, 0.28, o.halfW, o.y1 / 2);
  };

  const buildObstacleMesh = (o: Obstacle): THREE.Group => {
    const g = new THREE.Group();
    g.position.set(o.kind === 'sweeper' ? 0 : o.x, 0, -o.z);
    switch (o.kind) {
      case 'block': {
        const h = o.y1 - o.y0;
        part(g, dark, o.halfW * 2, h, o.depth * 2, 0, o.y0 + h / 2);
        part(g, hot, o.halfW * 2 + 0.02, 0.09, o.depth * 2 + 0.02, 0, o.y1 - 0.045);
        break;
      }
      case 'beam':
      case 'wall':
        laser(g, o, dark);
        break;
      case 'sweeper':
        laser(g, o, hot);
        break;
      case 'boost': {
        const base = new THREE.Mesh(planeGeo, padBase);
        base.rotation.x = -Math.PI / 2;
        base.scale.set(o.halfW * 2, o.depth * 2, 1);
        base.position.y = 0.02;
        const arrows = new THREE.Mesh(planeGeo, boostMat);
        arrows.rotation.x = -Math.PI / 2;
        arrows.scale.set(o.halfW * 2, o.depth * 2, 1);
        arrows.position.y = 0.03;
        g.add(base, arrows);
        break;
      }
      case 'gap': {
        // Glowing orange edge markers at gap boundaries
        part(g, hot, HALF * 2, 0.04, 0.22, 0, 0.03, o.depth);
        part(g, hot, HALF * 2, 0.04, 0.22, 0, 0.03, -o.depth);
        break;
      }
    }
    return g;
  };

  // Optional finish arch for finite levels only
  if (!level.endless && isFinite(level.length)) {
    const fin = new THREE.Group();
    fin.position.z = -level.length;
    part(fin, cyanBasic, 0.4, 5.5, 0.4, -(HALF + 0.4), 2.75);
    part(fin, cyanBasic, 0.4, 5.5, 0.4, HALF + 0.4, 2.75);
    part(fin, cyanBasic, HALF * 2 + 1.2, 0.5, 0.5, 0, 5.5);
    part(fin, curtain, HALF * 2, 5, 0.05, 0, 2.5);
    const checker = track(
      canvasTex(128, 16, (g) => {
        for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) {
          g.fillStyle = (x + y) % 2 ? '#ffffff' : '#101030';
          g.fillRect(x * 8, y * 8, 8, 8);
        }
      }),
    );
    const checkerMat = track(new THREE.MeshBasicMaterial({ map: checker }));
    part(fin, checkerMat, HALF * 2, 0.03, 1, 0, 0.02);
    group.add(fin);
  }

  // ---- lights ----
  const hemi = new THREE.HemisphereLight(0x8fb6ff, 0x1a0b3a, 0.95);
  const sun = new THREE.DirectionalLight(0xbfd9ff, 0.8);
  sun.position.set(-4, 9, 6);
  group.add(hemi, sun);

  scene.add(group);

  return {
    group,
    update(t: number, curDist = 0): void {
      // 1. Dynamic floor and rails ring buffer around curDist
      const firstTile = Math.floor((curDist - 32) / TILE);
      for (let n = 0; n < TILE_COUNT; n++) {
        const tileIdx = firstTile + n;
        const tileCenterZ = tileIdx * TILE + TILE / 2;
        let isGap = false;
        for (let i = 0; i < level.obstacles.length; i++) {
          const o = level.obstacles[i]!;
          if (o.kind === 'gap' && Math.abs(tileCenterZ - o.z) < o.depth) {
            isGap = true;
            break;
          }
          if (o.z - o.depth > tileCenterZ + 8) break;
        }

        if (isGap) {
          floor.setMatrixAt(n, m4.makeTranslation(0, -999, 0));
          rails.setMatrixAt(n * 2, m4.makeTranslation(0, -999, 0));
          rails.setMatrixAt(n * 2 + 1, m4.makeTranslation(0, -999, 0));
        } else {
          const z = -tileCenterZ;
          floor.setMatrixAt(n, m4.makeTranslation(0, -0.2, z));
          rails.setMatrixAt(n * 2, m4.makeTranslation(-(HALF + 0.1), 0.05, z));
          rails.setMatrixAt(n * 2 + 1, m4.makeTranslation(HALF + 0.1, 0.05, z));
        }
      }
      floor.instanceMatrix.needsUpdate = true;
      rails.instanceMatrix.needsUpdate = true;

      // 2. Continuous skyline cycling
      for (let n = 0; n < q.skyline; n++) {
        const b = buildings[n]!;
        const offset = Math.floor((curDist - b.relZ + 80) / SPAN_CITY) * SPAN_CITY;
        const z = -(b.relZ + offset);
        m4.compose(new THREE.Vector3(b.x, b.h / 2 - 60, z), qIdent, new THREE.Vector3(b.w, b.h, b.d));
        city.setMatrixAt(n, m4);
      }
      city.instanceMatrix.needsUpdate = true;

      // 3. Dynamic obstacle streaming within visible window [curDist - 40, curDist + 220]
      for (let i = 0; i < level.obstacles.length; i++) {
        const o = level.obstacles[i]!;
        if (o.z < curDist - 40) continue;
        if (o.z > curDist + 220) break;
        if (!activeMeshes.has(o.id)) {
          const g = buildObstacleMesh(o);
          group.add(g);
          activeMeshes.set(o.id, g);
          if (o.kind === 'sweeper') movers.push({ obj: g, o });
        }
      }

      // Despawn passed obstacles outside visible range
      for (const [id, mesh] of activeMeshes) {
        const o = level.obstacles[id];
        if (!o || o.z < curDist - 50 || o.z > curDist + 240) {
          group.remove(mesh);
          activeMeshes.delete(id);
          const mIdx = movers.findIndex((m) => m.o.id === id);
          if (mIdx !== -1) movers.splice(mIdx, 1);
        }
      }

      // 4. Update animated sweeper positions
      for (let i = 0; i < movers.length; i++) {
        const m = movers[i]!;
        m.obj.position.x = obstacleX(m.o, t);
      }
    },
    dispose(): void {
      scene.remove(group);
      floor.dispose();
      rails.dispose();
      city.dispose();
      for (const [, mesh] of activeMeshes) group.remove(mesh);
      activeMeshes.clear();
      movers.length = 0;
      for (const d of disposables) d.dispose();
      scene.background = null;
      scene.fog = null;
    },
  };
}
