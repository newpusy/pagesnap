const path = require('path');
const fs = require('fs');
const os = require('os');
const { mergeRetentionPolicy, isExpired, applyRetentionPolicy } = require('./retention');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-retention-'));
}

function seedSnapshots(dir, slug, names) {
  const slugDir = path.join(dir, slug);
  fs.mkdirSync(slugDir, { recursive: true });
  for (const name of names) {
    fs.writeFileSync(path.join(slugDir, name), 'fake');
  }
}

describe('mergeRetentionPolicy', () => {
  test('returns defaults when no policy given', () => {
    const p = mergeRetentionPolicy();
    expect(p.maxAgeDays).toBe(30);
    expect(p.maxCount).toBe(100);
    expect(p.keepOnChange).toBe(true);
  });

  test('overrides specific keys', () => {
    const p = mergeRetentionPolicy({ maxAgeDays: 7 });
    expect(p.maxAgeDays).toBe(7);
    expect(p.maxCount).toBe(100);
  });
});

describe('isExpired', () => {
  test('returns true for old timestamp', () => {
    expect(isExpired('snap-20200101T120000.png', 30)).toBe(true);
  });

  test('returns false for recent timestamp', () => {
    const now = new Date();
    const ts = now.toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', 'T');
    const datePart = ts.slice(0, 8) + 'T' + ts.slice(9, 15);
    expect(isExpired(`snap-${datePart}.png`, 30)).toBe(false);
  });

  test('returns false for unrecognised filename', () => {
    expect(isExpired('snapshot.png', 30)).toBe(false);
  });
});

describe('applyRetentionPolicy', () => {
  test('prunes expired files', () => {
    const dir = makeTempDir();
    seedSnapshots(dir, 'example-com', [
      'snap-20200101T120000.png',
      'snap-20200201T120000.png',
    ]);
    const result = applyRetentionPolicy(dir, 'example-com', { maxAgeDays: 30, maxCount: 100 });
    expect(result.pruned).toBe(2);
    expect(result.kept).toBe(0);
  });

  test('returns zero pruned when all files are recent', () => {
    const dir = makeTempDir();
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}T120000`;
    seedSnapshots(dir, 'example-com', [`snap-${ts}.png`]);
    const result = applyRetentionPolicy(dir, 'example-com', { maxAgeDays: 30, maxCount: 100 });
    expect(result.pruned).toBe(0);
    expect(result.kept).toBe(1);
  });
});
