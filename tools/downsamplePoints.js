// tools/downsamplePoints.js
//
// Reduces the constellation point clouds to a usable size.
// Run from the project root:  node tools/downsamplePoints.js
//
// Writes *.min.json next to the originals so you can compare before replacing.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Points kept per constellation. Raise for more detail, lower for smaller files.
const TARGET_POINTS = 30000;

// Decimal places kept per coordinate. OutlineStars divides by 100, so one
// decimal here means 0.001 precision in world units — far below what is visible.
const DECIMALS = 0;

const FILES = [
  'bookPoints.json',
  'cameraPoints.json',
  'catPoints.json',
  'flowerPoints.json',
  'headsetPoints.json',
];

const SRC_DIR = join(process.cwd(), 'src');

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

for (const file of FILES) {
  const inputPath = join(SRC_DIR, file);
  const outputPath = join(SRC_DIR, file.replace('.json', '.min.json'));

  const points = JSON.parse(readFileSync(inputPath, 'utf8'));
  const sizeBefore = statSync(inputPath).size;

  const step = Math.max(1, Math.floor(points.length / TARGET_POINTS));

  const reduced = [];
  for (let i = 0; i < points.length; i += step) {
    const [x, y] = points[i];
    reduced.push([Number(x.toFixed(DECIMALS)), Number(y.toFixed(DECIMALS))]);
  }

  writeFileSync(outputPath, JSON.stringify(reduced));
  const sizeAfter = statSync(outputPath).size;

  console.log(
    `${file.padEnd(20)} ${String(points.length).padStart(9)} pts (${formatMB(sizeBefore).padStart(6)} MB)` +
      `  ->  ${String(reduced.length).padStart(5)} pts (${(sizeAfter / 1024).toFixed(1).padStart(6)} KB)`,
  );
}

console.log('\nDone. Inspect the .min.json files, then replace the originals.');
