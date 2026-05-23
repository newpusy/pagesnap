// retention.js — defines and applies snapshot retention policies

const path = require('path');
const { listSnapshotFiles, pruneSnapshots } = require('./cleaner');

const DEFAULT_POLICY = {
  maxAgeDays: 30,
  maxCount: 100,
  keepOnChange: true,
};

function mergeRetentionPolicy(userPolicy = {}) {
  return Object.assign({}, DEFAULT_POLICY, userPolicy);
}

function isExpired(filename, maxAgeDays) {
  const match = filename.match(/(\d{8}T\d{6})/);
  if (!match) return false;
  const ts = match[1];
  const year = ts.slice(0, 4);
  const month = ts.slice(4, 6);
  const day = ts.slice(6, 8);
  const fileDate = new Date(`${year}-${month}-${day}`);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  return fileDate < cutoff;
}

function applyRetentionPolicy(snapshotDir, slug, policy = {}) {
  const merged = mergeRetentionPolicy(policy);
  const files = listSnapshotFiles(snapshotDir, slug);

  const expired = files.filter(f => isExpired(path.basename(f), merged.maxAgeDays));
  const remaining = files.filter(f => !expired.includes(f));

  let toPrune = [...expired];

  if (remaining.length > merged.maxCount) {
    const overflow = remaining.slice(0, remaining.length - merged.maxCount);
    toPrune = toPrune.concat(overflow);
  }

  if (toPrune.length === 0) return { pruned: 0, kept: files.length };

  pruneSnapshots(toPrune);
  return { pruned: toPrune.length, kept: files.length - toPrune.length };
}

function applyRetentionToAll(snapshotDir, slugs, policy = {}) {
  const results = {};
  for (const slug of slugs) {
    results[slug] = applyRetentionPolicy(snapshotDir, slug, policy);
  }
  return results;
}

module.exports = { mergeRetentionPolicy, isExpired, applyRetentionPolicy, applyRetentionToAll };
