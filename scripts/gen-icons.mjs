// Generates the PWA icons without external dependencies.
// Run with: npm run icons

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const APP_DIR = join(ROOT, "src", "app");

mkdirSync(ICONS_DIR, { recursive: true });

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let row = 0; row < height; row += 1) {
    raw[row * (stride + 1)] = 0;
    pixels.copy(raw, row * (stride + 1) + 1, row * stride, (row + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function insideRoundedRect(x, y, x0, y0, x1, y1, radius) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + radius), x1 - radius);
  const cy = Math.min(Math.max(y, y0 + radius), y1 - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

const GLYPH_R = [
  "11110",
  "10001",
  "10001",
  "11110",
  "10100",
  "10010",
  "10001",
];

function lerp(from, to, t) {
  return Math.round(from + (to - from) * t);
}

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4);

  const inset = maskable ? size * 0.2 : size * 0.13;
  const x0 = inset;
  const y0 = inset;
  const x1 = size - inset;
  const y1 = size - inset;
  const radius = size * 0.16;

  const glyphHeight = (y1 - y0) * 0.44;
  const unit = glyphHeight / 7;
  const glyphWidth = unit * 5;
  const glyphX = (size - glyphWidth) / 2;
  const glyphY = (size - glyphHeight) / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const t = (x + y) / (2 * size);
      let r = lerp(124, 219, t);
      let g = lerp(58, 39, t);
      let b = lerp(237, 119, t);

      if (insideRoundedRect(x, y, x0, y0, x1, y1, radius)) {
        r = 255;
        g = 255;
        b = 255;

        const gx = Math.floor((x - glyphX) / unit);
        const gy = Math.floor((y - glyphY) / unit);
        if (gx >= 0 && gx < 5 && gy >= 0 && gy < 7 && GLYPH_R[gy][gx] === "1") {
          r = 91;
          g = 33;
          b = 182;
        }
      }

      const offset = (y * size + x) * 4;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = 255;
    }
  }

  return encodePng(size, size, pixels);
}

const outputs = [
  [join(ICONS_DIR, "icon-192.png"), 192, false],
  [join(ICONS_DIR, "icon-512.png"), 512, false],
  [join(ICONS_DIR, "maskable-512.png"), 512, true],
  [join(ICONS_DIR, "apple-touch-icon.png"), 180, false],
  [join(APP_DIR, "icon.png"), 192, false],
];

for (const [path, size, maskable] of outputs) {
  writeFileSync(path, drawIcon(size, { maskable }));
  console.log(`icon ${size}px -> ${path}`);
}
