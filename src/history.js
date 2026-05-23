// history.js — retrieve and filter past report entries for a given URL slug

const { readReportEntries } = require('./reporter');

/**
 * Return all report entries for a specific slug.
 * @param {string} slug
 * @param {string} reportPath
 * @returns {Promise<object[]>}
 */
async function getHistoryForSlug(slug, reportPath) {
  const entries = await readReportEntries(reportPath);
  return entries.filter(e => e.slug === slug);
}

/**
 * Return the N most recent entries for a slug.
 * @param {string} slug
 * @param {number} limit
 * @param {string} reportPath
 * @returns {Promise<object[]>}
 */
async function getRecentHistory(slug, limit = 10, reportPath) {
  const entries = await getHistoryForSlug(slug, reportPath);
  return entries.slice(-limit);
}

/**
 * Return only entries where a visual change was detected.
 * @param {string} slug
 * @param {string} reportPath
 * @returns {Promise<object[]>}
 */
async function getChangedEntries(slug, reportPath) {
  const entries = await getHistoryForSlug(slug, reportPath);
  return entries.filter(e => e.changed === true);
}

/**
 * Summarise history for a slug: total runs, total changes, last checked.
 * @param {string} slug
 * @param {string} reportPath
 * @returns {Promise<object>}
 */
async function summariseHistory(slug, reportPath) {
  const entries = await getHistoryForSlug(slug, reportPath);
  const changed = entries.filter(e => e.changed === true).length;
  const lastEntry = entries[entries.length - 1] || null;
  return {
    slug,
    totalRuns: entries.length,
    totalChanges: changed,
    lastChecked: lastEntry ? lastEntry.timestamp : null,
  };
}

module.exports = { getHistoryForSlug, getRecentHistory, getChangedEntries, summariseHistory };
