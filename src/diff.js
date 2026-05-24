import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Compute a simple hash of a file's contents for quick change detection.
 * @param {string} filePath
 * @returns {string|null} hex digest, or null if the file doesn't exist
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
 * @param {number} [threshold=0.1] - pixelmatch per-pixel sensitivity (0–1)
 * @returns {{ diffPixels: number, totalPixels: number, diffRatio: number, dimensionMismatch: boolean }}
 */
export function diffScreenshots(baselinePath, currentPath, threshold = 0.1) {
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
    { threshold }
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

/**
 * Quick check using file hashes before doing a full pixel diff.
 * Returns false immediately if the files are byte-for-byte identical,
 * saving the cost of decoding and comparing PNG data.
 * @param {string} baselinePath
 * @param {string} currentPath
 * @returns {boolean} true if the files differ (or baseline is missing), false if identical
 */
export function filesAreDifferent(baselinePath, currentPath) {
  const baselineHash = hashFile(baselinePath);
  const currentHash = hashFile(currentPath);
  if (baselineHash === null || currentHash === null) return true;
  return baselineHash !== currentHash;
}
