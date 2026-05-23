// retentioncli.js — CLI interface for running retention policy manually

const path = require('path');
const { loadConfig } = require('./config');
const { applyRetentionToAll } = require('./retention');
const { listSnapshotFiles } = require('./cleaner');
const fs = require('fs');

function getSlugs(snapshotDir) {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs.readdirSync(snapshotDir).filter(entry => {
    return fs.statSync(path.join(snapshotDir, entry)).isDirectory();
  });
}

function parseCliArgs(argv = process.argv.slice(2)) {
  const dryRun = argv.includes('--dry-run');
  const configPath = (() => {
    const idx = argv.indexOf('--config');
    return idx !== -1 ? argv[idx + 1] : 'pagesnap.config.json';
  })();
  return { dryRun, configPath };
}

async function runRetentionCli(argv) {
  const { dryRun, configPath } = parseCliArgs(argv);
  const config = loadConfig(configPath);
  const snapshotDir = config.snapshotDir || 'snapshots';
  const policy = config.retention || {};

  const slugs = getSlugs(snapshotDir);

  if (slugs.length === 0) {
    console.log('No snapshot directories found.');
    return;
  }

  if (dryRun) {
    console.log('[dry-run] Would apply retention to slugs:', slugs.join(', '));
    return;
  }

  const results = applyRetentionToAll(snapshotDir, slugs, policy);

  for (const [slug, result] of Object.entries(results)) {
    console.log(`${slug}: pruned=${result.pruned}, kept=${result.kept}`);
  }

  const totalPruned = Object.values(results).reduce((sum, r) => sum + r.pruned, 0);
  console.log(`\nRetention complete. Total pruned: ${totalPruned}`);
}

module.exports = { parseCliArgs, runRetentionCli, getSlugs };
