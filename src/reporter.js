import fs from 'fs';
import path from 'path';

/**
 * Formats a timestamp as a human-readable string.
 * @param {Date} date
 * @returns {string}
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Builds a report entry for a single snapshot comparison.
 * @param {object} params
 * @returns {object}
 */
export function buildReportEntry({ url, slug, timestamp, hasChange, snapshotPath, diffPath = null }) {
  return {
    url,
    slug,
    timestamp: formatTimestamp(timestamp),
    hasChange: Boolean(hasChange),
    snapshotPath,
    diffPath,
  };
}

/**
 * Appends a report entry to a JSON-lines report file.
 * @param {string} reportFile - Path to the .jsonl report file.
 * @param {object} entry
 * @returns {void}
 */
export function appendReportEntry(reportFile, entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.appendFileSync(reportFile, line, 'utf8');
}

/**
 * Reads all entries from a JSON-lines report file.
 * @param {string} reportFile
 * @returns {object[]}
 */
export function readReportEntries(reportFile) {
  if (!fs.existsSync(reportFile)) return [];
  const raw = fs.readFileSync(reportFile, 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/**
 * Summarises a list of report entries.
 * @param {object[]} entries
 * @returns {{ total: number, changed: number, unchanged: number }}
 */
export function summariseReport(entries) {
  const changed = entries.filter((e) => e.hasChange).length;
  return {
    total: entries.length,
    changed,
    unchanged: entries.length - changed,
  };
}
