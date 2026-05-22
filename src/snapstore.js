import fs from 'fs/promises';
import path from 'path';

/**
 * List all snapshot PNG files for a given URL slug, sorted oldest → newest.
 * @param {string} baseDir
 * @param {string} slug - Subdirectory name (URL slug).
 * @returns {Promise<string[]>} Absolute file paths.
 */
export async function listSnapshots(baseDir, slug) {
  const dir = path.join(baseDir, slug);
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.png'))
    .sort()
    .map((f) => path.join(dir, f));
}

/**
 * Return the two most recent snapshots for a slug, or null if fewer than 2 exist.
 * @param {string} baseDir
 * @param {string} slug
 * @returns {Promise<{previous: string, current: string} | null>}
 */
export async function getLatestPair(baseDir, slug) {
  const snaps = await listSnapshots(baseDir, slug);
  if (snaps.length < 2) return null;
  return {
    previous: snaps[snaps.length - 2],
    current: snaps[snaps.length - 1],
  };
}

/**
 * Prune old snapshots, keeping only the most recent `keep` files.
 * @param {string} baseDir
 * @param {string} slug
 * @param {number} keep - Number of snapshots to retain.
 * @returns {Promise<string[]>} List of deleted file paths.
 */
export async function pruneSnapshots(baseDir, slug, keep = 10) {
  const snaps = await listSnapshots(baseDir, slug);
  if (snaps.length <= keep) return [];
  const toDelete = snaps.slice(0, snaps.length - keep);
  await Promise.all(toDelete.map((f) => fs.unlink(f)));
  return toDelete;
}
