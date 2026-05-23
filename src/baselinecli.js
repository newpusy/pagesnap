// baselinecli.js — CLI for managing baselines

const path = require('path');
const { loadConfig } = require('./config');
const { getBaselinePath, setBaseline, clearBaseline, listBaselines, baselineExists } = require('./baseline');
const { buildScreenshotPath } = require('./screenshot');

function parseCliArgs(argv = process.argv.slice(2)) {
  const [command, slug] = argv;
  return { command, slug };
}

function resolveBaselineDir(cfg) {
  return (cfg && cfg.baselineDir) ? cfg.baselineDir : 'baselines';
}

async function runBaselineCli(argv = process.argv.slice(2), log = console.log) {
  const { command, slug } = parseCliArgs(argv);
  let cfg = {};
  try { cfg = await loadConfig(); } catch (_) {}
  const baselineDir = resolveBaselineDir(cfg);

  if (command === 'list') {
    const slugs = listBaselines(baselineDir);
    if (slugs.length === 0) { log('No baselines set.'); return; }
    slugs.forEach(s => log(s));
    return;
  }

  if (!slug) {
    log('Usage: baseline <set|clear|check|list> [slug]');
    return;
  }

  if (command === 'set') {
    const snapshotDir = (cfg && cfg.snapshotDir) ? cfg.snapshotDir : 'snapshots';
    const snapPath = buildScreenshotPath(snapshotDir, slug);
    try {
      const dest = setBaseline(slug, snapPath, baselineDir);
      log(`Baseline set: ${dest}`);
    } catch (e) {
      log(`Error: ${e.message}`);
    }
    return;
  }

  if (command === 'clear') {
    const removed = clearBaseline(slug, baselineDir);
    log(removed ? `Baseline cleared: ${slug}` : `No baseline found for: ${slug}`);
    return;
  }

  if (command === 'check') {
    const exists = baselineExists(slug, baselineDir);
    log(exists ? `Baseline exists: ${slug}` : `No baseline for: ${slug}`);
    return;
  }

  log(`Unknown command: ${command}`);
}

module.exports = { parseCliArgs, resolveBaselineDir, runBaselineCli };
