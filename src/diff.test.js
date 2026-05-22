import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { PNG } from 'pngjs';
import { hashFile, diffScreenshots, hasVisualChange } from './diff.js';

const TMP = join(process.cwd(), 'tmp-diff-test');

function makePng(filePath, width, height, fillColor) {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    png.data[idx]     = fillColor[0];
    png.data[idx + 1] = fillColor[1];
    png.data[idx + 2] = fillColor[2];
    png.data[idx + 3] = 255;
  }
  writeFileSync(filePath, PNG.sync.write(png));
}

beforeAll(() => {
  mkdirSync(TMP, { recursive: true });
});

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true });
});

describe('hashFile', () => {
  it('returns null for a missing file', () => {
    expect(hashFile(join(TMP, 'nope.png'))).toBeNull();
  });

  it('returns consistent hex string for the same file', () => {
    const p = join(TMP, 'hash-test.png');
    makePng(p, 10, 10, [255, 0, 0]);
    const h1 = hashFile(p);
    const h2 = hashFile(p);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('returns different hashes for different files', () => {
    const p1 = join(TMP, 'a.png');
    const p2 = join(TMP, 'b.png');
    makePng(p1, 10, 10, [255, 0, 0]);
    makePng(p2, 10, 10, [0, 255, 0]);
    expect(hashFile(p1)).not.toBe(hashFile(p2));
  });
});

describe('diffScreenshots', () => {
  it('reports zero diff for identical images', () => {
    const p = join(TMP, 'same.png');
    makePng(p, 20, 20, [100, 100, 100]);
    const result = diffScreenshots(p, p);
    expect(result.diffPixels).toBe(0);
    expect(result.diffRatio).toBe(0);
  });

  it('reports non-zero diff for different images', () => {
    const p1 = join(TMP, 'c1.png');
    const p2 = join(TMP, 'c2.png');
    makePng(p1, 20, 20, [255, 255, 255]);
    makePng(p2, 20, 20, [0, 0, 0]);
    const result = diffScreenshots(p1, p2);
    expect(result.diffPixels).toBeGreaterThan(0);
  });

  it('flags dimension mismatch', () => {
    const p1 = join(TMP, 'd1.png');
    const p2 = join(TMP, 'd2.png');
    makePng(p1, 10, 10, [0, 0, 255]);
    makePng(p2, 20, 10, [0, 0, 255]);
    const result = diffScreenshots(p1, p2);
    expect(result.dimensionMismatch).toBe(true);
  });

  it('throws when baseline is missing', () => {
    expect(() => diffScreenshots(join(TMP, 'ghost.png'), join(TMP, 'same.png')))
      .toThrow('Baseline not found');
  });
});

describe('hasVisualChange', () => {
  it('returns false when ratio is below threshold', () => {
    expect(hasVisualChange({ diffRatio: 0.005, dimensionMismatch: false })).toBe(false);
  });

  it('returns true when ratio exceeds threshold', () => {
    expect(hasVisualChange({ diffRatio: 0.05, dimensionMismatch: false })).toBe(true);
  });

  it('returns true on dimension mismatch regardless of ratio', () => {
    expect(hasVisualChange({ diffRatio: 0, dimensionMismatch: true })).toBe(true);
  });
});
