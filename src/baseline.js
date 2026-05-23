// baseline.js — manage baseline snapshots for diff comparison

const fs = require('fs');
const path = require('path');

const DEFAULT_BASELINE_DIR = 'baselines';

function getBaselinePath(slug, baselineDir = DEFAULT_BASELINE_DIR) {
  return path.join(baselineDir, `${slug}.baseline.png`);
}

function baselineExists(slug, baselineDir = DEFAULT_BASELINE_DIR) {
  return fs.existsSync(getBaselinePath(slug, baselineDir));
}

function setBaseline(slug, sourcePath, baselineDir = DEFAULT_BASELINE_DIR) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source snapshot not found: ${sourcePath}`);
  }
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }
  const dest = getBaselinePath(slug, baselineDir);
  fs.copyFileSync(sourcePath, dest);
  return dest;
}

function clearBaseline(slug, baselineDir = DEFAULT_BASELINE_DIR) {
  const p = getBaselinePath(slug, baselineDir);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    return true;
  }
  return false;
}

function listBaselines(baselineDir = DEFAULT_BASELINE_DIR) {
  if (!fs.existsSync(baselineDir)) return [];
  return fs.readdirSync(baselineDir)
    .filter(f => f.endsWith('.baseline.png'))
    .map(f => f.replace('.baseline.png', ''));
}

module.exports = {
  getBaselinePath,
  baselineExists,
  setBaseline,
  clearBaseline,
  listBaselines,
};
