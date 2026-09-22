import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.resolve('public/pwa-192x192.png'));

  // 512x512 standard
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.resolve('public/pwa-512x512.png'));

  // 512x512 maskable (with safe zone background)
  // Maskable icons require full bleed background (#101012)
  const bg = Buffer.from(
    '<svg width="512" height="512"><rect width="512" height="512" fill="#121214"/></svg>'
  );
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410) // 80% safe zone
    .toBuffer();

  await sharp(bg)
    .composite([{ input: innerIcon, gravity: 'center' }])
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.resolve('public/apple-touch-icon.png'));

  // Favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/favicon.png'));

  console.log('Sharp PNG icons generated successfully!');
}

generate().catch(console.error);
