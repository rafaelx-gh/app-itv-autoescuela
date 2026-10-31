import fs from 'fs';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 2; // RGB color type
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // No interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines: filter byte (0) + width * 3 bytes (R, G, B)
  const lineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineLength);
  
  // Center drawing bounds
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineLength;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Simple icon badge drawing: outer dark circle, blue shield area, green check accent
      if (dist < innerRadius && Math.abs(dx) < innerRadius * 0.7 && Math.abs(dy) < innerRadius * 0.7) {
        // Bright blue tech center
        rawData[pxOffset] = 37;     // R
        rawData[pxOffset + 1] = 99;  // G
        rawData[pxOffset + 2] = 235; // B
      } else if (dist < radius) {
        // Cyan / emerald accent border
        rawData[pxOffset] = 16;
        rawData[pxOffset + 1] = 185;
        rawData[pxOffset + 2] = 129;
      } else {
        // Dark slate background (#0f172a)
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = data.length;
  const header = Buffer.alloc(8);
  header.writeUInt32BE(length, 0);
  header.write(type, 4, 4, 'ascii');

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf1, buf2) {
    let c = 0xffffffff;
    for (let i = 0; i < buf1.length; i++) {
      c = crcTable[(c ^ buf1[i]) & 0xff] ^ (c >>> 8);
    }
    for (let i = 0; i < buf2.length; i++) {
      c = crcTable[(c ^ buf2[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const crcVal = crc32(Buffer.from(type, 'ascii'), data);
  const footer = Buffer.alloc(4);
  footer.writeUInt32BE(crcVal, 0);

  return Buffer.concat([header, data, footer]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createSolidPNG(192, 192, 15, 23, 42));
fs.writeFileSync('./public/pwa-512x512.png', createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createSolidPNG(512, 512, 15, 23, 42));
fs.writeFileSync('./public/apple-touch-icon.png', createSolidPNG(180, 180, 15, 23, 42));
console.log('PWA PNG icons generated successfully!');
