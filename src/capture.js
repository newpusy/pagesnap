import { takeScreenshot, buildScreenshotPath } from './screenshot.js';
import { pruneSnapshots } from './snapstore.js';

/**
 * Derive the URL slug used as a subdirectory name.
 * Mirrors the logic in buildScreenshotPath.
 * @param {string} url
 * @returns {string}
 */
export function urlToSlug(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Capture a screenshot for a page entry from the config and prune old snapshots.
 * @param {object} pageEntry - A single entry from config.pages.
 * @param {string} snapshotDir - Root directory for all snapshots.
 * @param {object} [opts]
 * @param {number} [opts.keep=10] - Max snapshots to retain per page.
 * @returns {Promise<{url: string, path: string, pruned: string[]}>}
 */
export async function capturePage(pageEntry, snapshotDir, opts = {}) {
  const { url, viewport } = pageEntry;
  const { keep = 10 } = opts;

  const outputPath = buildScreenshotPath(snapshotDir, url, new Date());
  await takeScreenshot(url, outputPath, viewport ?? {});

  const slug = urlToSlug(url);
  const pruned = await pruneSnapshots(snapshotDir, slug, keep);

  return { url, path: outputPath, pruned };
}

/**
 * Capture screenshots for all pages defined in config.
 * @param {object} config - Loaded pagesnap config.
 * @returns {Promise<Array<{url: string, path: string, pruned: string[]}>>}
 */
export async function captureAll(config) {
  const { pages, snapshotDir, keep } = config;
  const results = [];
  for (const page of pages) {
    try {
      const result = await capturePage(page, snapshotDir, { keep });
      results.push(result);
    } catch (err) {
      console.error(`[pagesnap] Failed to capture ${page.url}:`, err.message);
      results.push({ url: page.url, error: err.message });
    }
  }
  return results;
}
