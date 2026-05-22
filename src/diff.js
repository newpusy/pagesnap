import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Compute a simple hash of a file's contents for quick change detection.
 * @param {string} filePath
 * @returns {string} hex digest
 */
export function hashFile(filePath) {
  if (!existsSync(filePath)) return null;
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * Compare two PNG screenshot files pixel-by-pixel.
 * @param {string} baselinePath - path to the reference screenshot
 * @param {string} currentPath  - path to the new screenshot
 * @returns {{ diffPixels: number, totalPixels: number, diffRatio: number }}
 */
export function diffScreenshots(baselinePath, currentPath) {
  if (!existsSync(baselinePath)) {
    throw new Error(`Baseline not found: ${baselinePath}`);
  }
  if (!existsSync(currentPath)) {
    throw new Error(`Current screenshot not found: ${currentPath}`);
  }

  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const current = PNG.sync.read(readFileSync(currentPath));

  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      diffPixels: -1,
      totalPixels: -1,
      diffRatio: 1,
      dimensionMismatch: true,
    };
  }

  const { width, height } = baseline;
  const totalPixels = width * height;
  const diffOutput = new Uint8Array(width * height * 4);

  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diffOutput,
    width,
    height,
    { threshold: 0.1 }
  );

  return {
    diffPixels,
    totalPixels,
    diffRatio: diffPixels / totalPixels,
    dimensionMismatch: false,
  };
}

/**
 * Decide whether a diff result counts as a meaningful visual change.
 * @param {{ diffRatio: number, dimensionMismatch: boolean }} result
 * @param {number} [threshold=0.01] - ratio (0–1) above which we flag a change
 * @returns {boolean}
 */
export function hasVisualChange(result, threshold = 0.01) {
  if (result.dimensionMismatch) return true;
  return result.diffRatio > threshold;
}
