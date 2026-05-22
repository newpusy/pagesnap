/**
 * cleaner.js — removes old screenshots and report entries beyond retention limits
 */

const fs = require('fs');
const path = require('path');

/**
 * List snapshot files for a given slug, sorted oldest first.
 * @param {string} snapshotDir
 * @param {string} slug
 * @returns {string[]}
 */
function listSnapshotFiles(snapshotDir, slug) {
  const dir = path.join(snapshotDir, slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(dir, f))
    .sort(); // ISO timestamp names sort chronologically
}

/**
 * Delete snapshot files exceeding the keep limit for a slug.
 * @param {string} snapshotDir
 * @param {string} slug
 * @param {number} keepLast  number of snapshots to retain
 * @returns {string[]} paths of deleted files
 */
function pruneSnapshots(snapshotDir, slug, keepLast) {
  if (keepLast < 1) throw new Error('keepLast must be >= 1');
  const files = listSnapshotFiles(snapshotDir, slug);
  if (files.length <= keepLast) return [];
  const toDelete = files.slice(0, files.length - keepLast);
  toDelete.forEach(f => fs.unlinkSync(f));
  return toDelete;
}

/**
 * Prune snapshots for every slug found in snapshotDir.
 * @param {string} snapshotDir
 * @param {number} keepLast
 * @returns {{ slug: string, deleted: string[] }[]}
 */
function pruneAll(snapshotDir, keepLast) {
  if (!fs.existsSync(snapshotDir)) return [];
  const slugs = fs
    .readdirSync(snapshotDir)
    .filter(entry => fs.statSync(path.join(snapshotDir, entry)).isDirectory());
  return slugs.map(slug => ({
    slug,
    deleted: pruneSnapshots(snapshotDir, slug, keepLast),
  }));
}

module.exports = { listSnapshotFiles, pruneSnapshots, pruneAll };
