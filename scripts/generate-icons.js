// Pure Node.js script using built-in zlib to generate valid PNG icons for PWA
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // Width, Height, Bit depth 8, Color type 6 (RGBA), Compression 0, Filter 0, Interlace 0
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8; // 8 bits per channel
  IHDR[9] = 6; // RGBA
  IHDR[10] = 0;
  IHDR[11] = 0;
  IHDR[12] = 0;

  // Raw pixel data: for each row, 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #101012 (dark neutral)
      let r = 16, g = 16, b = 18, a = 255;

      if (!isMaskable) {
        // Squircle corner check
        const cornerR = width * 0.22;
        const inCornerX = Math.min(x, width - 1 - x);
        const inCornerY = Math.min(y, height - 1 - y);
        if (inCornerX < cornerR && inCornerY < cornerR) {
          const cornerDist = Math.sqrt(
            Math.pow(cornerR - inCornerX, 2) + Math.pow(cornerR - inCornerY, 2)
          );
          if (cornerDist > cornerR) {
            a = 0; // Transparent outside corner
          }
        }
      }

      // Draw stylized Threads spiral & symbol
      if (a > 0) {
        // Center ring / spiral symbol
        const ring1 = Math.abs(dist - radius * 0.58);
        const ring2 = Math.abs(dist - radius * 0.25);

        // Threads @ spiral
        if (ring1 < width * 0.04) {
          r = 245; g = 245; b = 247;
        } else if (ring2 < width * 0.038 && (x < cx + width * 0.15)) {
          r = 245; g = 245; b = 247;
        }

        // Green checkmark / clean badge at bottom right
        const badgeCx = cx + width * 0.26;
        const badgeCy = cy + height * 0.26;
        const badgeDist = Math.sqrt(Math.pow(x - badgeCx, 2) + Math.pow(y - badgeCy, 2));
        const badgeR = width * 0.14;

        if (badgeDist < badgeR) {
          if (badgeDist < badgeR - width * 0.015) {
            // Emerald green #10b981
            r = 16; g = 185; b = 129;
          } else {
            // Dark ring border
            r = 16; g = 16; b = 18;
          }

          // Checkmark line
          const bx = x - badgeCx;
          const by = y - badgeCy;
          if (
            (bx >= -width * 0.05 && bx <= 0 && Math.abs(by - (bx + width * 0.04)) < width * 0.018) ||
            (bx >= 0 && bx <= width * 0.06 && Math.abs(by - (-bx * 0.9 + width * 0.035)) < width * 0.018)
          ) {
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress raw data
  const compressed = zlib.deflateSync(rawData);

  // PNG chunks helper
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', IHDR);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate files
const outDir = path.resolve('public');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, false));

console.log('Successfully generated PWA PNG icons in public/');
