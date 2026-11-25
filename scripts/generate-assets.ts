import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// --- CRC32 & PNG Chunk Helpers ---
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[i] = c >>> 0;
}

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]!) & 0xFF]!;
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function makePng(width: number, height: number, getPixel: (x: number, y: number) => RGBA): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const p = getPixel(x, y);
      raw[pos++] = Math.max(0, Math.min(255, Math.round(p.r)));
      raw[pos++] = Math.max(0, Math.min(255, Math.round(p.g)));
      raw[pos++] = Math.max(0, Math.min(255, Math.round(p.b)));
      raw[pos++] = Math.max(0, Math.min(255, Math.round(p.a)));
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeIcoFromPng(png: Buffer, size = 32): Buffer {
  // 6 byte ICONDIR + 16 byte ICONDIRENTRY + PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8); // resource bytes
  entry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  return Buffer.concat([header, entry, png]);
}

// --- Lightning shape rasterizer helper ---
function isInsideLightning(x: number, y: number, w: number, h: number): boolean {
  // Normalize to [0, 1]
  const nx = x / w;
  const ny = y / h;

  // Upper segment: triangle from (0.55, 0.15) to (0.28, 0.52) to (0.50, 0.52)
  // Lower segment: triangle from (0.43, 0.48) to (0.75, 0.48) to (0.42, 0.85)
  // Check if point falls within polygon: (0.55, 0.15), (0.26, 0.52), (0.48, 0.52), (0.40, 0.85), (0.74, 0.46), (0.52, 0.46)
  const poly = [
    [0.55, 0.15],
    [0.26, 0.52],
    [0.48, 0.52],
    [0.40, 0.85],
    [0.74, 0.46],
    [0.52, 0.46],
  ];

  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]![0]!, yi = poly[i]![1]!;
    const xj = poly[j]![0]!, yj = poly[j]![1]!;
    const intersect = ((yi > ny) !== (yj > ny)) &&
      (nx < (xj - xi) * (ny - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 1. Generate Favicon (32x32 PNG -> ICO)
const fav32Png = makePng(32, 32, (x, y) => {
  const distCenter = Math.hypot(x - 15.5, y - 15.5);
  // Rounded corner plate
  if (distCenter > 16.5) return { r: 0, g: 0, b: 0, a: 0 };

  if (isInsideLightning(x, y, 32, 32)) {
    // Neon Cyan to Amber
    const t = y / 32;
    return {
      r: 43 + t * 212,
      g: 240 - t * 134,
      b: 255 - t * 229,
      a: 255,
    };
  }

  // Border glow
  if (distCenter >= 14 && distCenter <= 16) {
    return { r: 43, g: 240, b: 255, a: 220 };
  }

  // Background
  return { r: 7, g: 4, b: 26, a: 255 };
});

const icoBuf = makeIcoFromPng(fav32Png, 32);
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuf);
console.log('✓ Created public/favicon.ico');

// 2. Generate Apple Touch Icon (180x180 PNG)
const appleIcon = makePng(180, 180, (x, y) => {
  const ny = y / 180;

  // Rounded squircle mask
  const rx = Math.abs(x - 90);
  const ry = Math.abs(y - 90);
  const rCorner = 36;
  const inBorder = rx > (90 - rCorner) && ry > (90 - rCorner);
  if (inBorder) {
    const d = Math.hypot(rx - (90 - rCorner), ry - (90 - rCorner));
    if (d > rCorner) return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Neon lightning bolt
  if (isInsideLightning(x, y, 180, 180)) {
    const t = ny;
    return {
      r: Math.round(43 + t * 212),
      g: Math.round(240 - t * 134),
      b: Math.round(255 - t * 229),
      a: 255,
    };
  }

  // Cyan rim border (3px)
  const isNearEdge = (rx > 87 || ry > 87);
  if (isNearEdge) {
    return { r: 43, g: 240, b: 255, a: 255 };
  }

  // Subtle grid lines
  const isGridX = (x % 30 === 0 && ny > 0.6);
  const isGridY = (y === 120 || y === 145 || y === 165);
  if (isGridX || isGridY) {
    return { r: 43, g: 240, b: 255, a: 80 };
  }

  // Background gradient: dark cyber void
  const bgR = Math.round(10 + ny * 15);
  const bgG = Math.round(5 + ny * 8);
  const bgB = Math.round(36 + (1 - ny) * 20);
  return { r: bgR, g: bgG, b: bgB, a: 255 };
});

fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Created public/apple-touch-icon.png');

// 3. Generate Social Open Graph Image (1200x630 PNG)
console.log('Generating 1200x630 OpenGraph social card...');
const ogImage = makePng(1200, 630, (x, y) => {
  // Horizon and perspective grid (ground is y > 380)
  const horizonY = 380;
  const isGround = y >= horizonY;

  // Base background color
  let r = 7;
  let g = 4;
  let b = 26;

  // Deep sky gradient with nebula center glow
  const skyDist = Math.hypot((x - 600) * 0.8, (y - 200) * 1.5);
  const skyGlow = Math.max(0, 1 - skyDist / 600);
  r += Math.round(skyGlow * 35);
  g += Math.round(skyGlow * 15);
  b += Math.round(skyGlow * 75);

  // Distant horizon neon line
  if (Math.abs(y - horizonY) < 2) {
    return { r: 43, g: 240, b: 255, a: 240 };
  }

  // Ground 3D perspective grid
  if (isGround) {
    const groundDepth = (y - horizonY) / (630 - horizonY); // 0 at horizon, 1 at bottom
    // Horizontal grid lines with perspective spacing
    const yGridSteps = [0.08, 0.18, 0.32, 0.50, 0.72, 0.95];
    const isHorizLine = yGridSteps.some(step => Math.abs(groundDepth - step) < 0.008);

    // Perspective lines radiating from center (600, 380)
    const angle = (x - 600) / Math.max(1, (y - horizonY) * 1.6);
    const isRadiantLine = Math.abs(angle % 0.35) < 0.025;

    // Track rails in center (x = 420 and x = 780 at bottom)
    const leftRailX = 600 - groundDepth * 280;
    const rightRailX = 600 + groundDepth * 280;
    const isLeftRail = Math.abs(x - leftRailX) < 4;
    const isRightRail = Math.abs(x - rightRailX) < 4;

    if (isLeftRail || isRightRail) {
      return { r: 43, g: 240, b: 255, a: 255 }; // Glowing Cyan Rails
    }

    if (isHorizLine || isRadiantLine) {
      const alpha = Math.min(1, groundDepth * 1.2);
      r = Math.round(r * (1 - alpha) + 30 * alpha);
      g = Math.round(g * (1 - alpha) + 180 * alpha);
      b = Math.round(b * (1 - alpha) + 240 * alpha);
    }
  }

  // Glowing lightning icon at top-center (x ~ 600, y ~ 160)
  const boltW = 140;
  const boltH = 170;
  const boltX0 = 600 - boltW / 2;
  const boltY0 = 70;
  if (x >= boltX0 && x <= boltX0 + boltW && y >= boltY0 && y <= boltY0 + boltH) {
    if (isInsideLightning(x - boltX0, y - boltY0, boltW, boltH)) {
      const t = (y - boltY0) / boltH;
      return {
        r: Math.round(43 + t * 212),
        g: Math.round(240 - t * 134),
        b: Math.round(255 - t * 229),
        a: 255,
      };
    }
  }

  // Outer border neon frame
  const isOuterBorder = (x < 6 || x > 1193 || y < 6 || y > 623);
  if (isOuterBorder) {
    return { r: 43, g: 240, b: 255, a: 220 };
  }

  return { r, g, b, a: 255 };
});

fs.writeFileSync(path.join(PUBLIC_DIR, 'og-image.png'), ogImage);
console.log('✓ Created public/og-image.png (1200x630)');
