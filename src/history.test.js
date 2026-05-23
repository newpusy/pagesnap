const fs = require('fs');
const os = require('os');
const path = require('path');
const { appendReportEntry } = require('./reporter');
const { getHistoryForSlug, getRecentHistory, getChangedEntries, summariseHistory } = require('./history');

let tmpFile;

beforeEach(() => {
  tmpFile = path.join(os.tmpdir(), `history-test-${Date.now()}.ndjson`);
});

afterEach(() => {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

async function seedEntries(reportPath) {
  await appendReportEntry({ slug: 'example-com', url: 'https://example.com', timestamp: '2024-01-01T00:00:00Z', changed: false, snapshot: 'a.png' }, reportPath);
  await appendReportEntry({ slug: 'example-com', url: 'https://example.com', timestamp: '2024-01-02T00:00:00Z', changed: true,  snapshot: 'b.png' }, reportPath);
  await appendReportEntry({ slug: 'example-com', url: 'https://example.com', timestamp: '2024-01-03T00:00:00Z', changed: false, snapshot: 'c.png' }, reportPath);
  await appendReportEntry({ slug: 'other-site',  url: 'https://other.site',  timestamp: '2024-01-01T00:00:00Z', changed: true,  snapshot: 'd.png' }, reportPath);
}

test('getHistoryForSlug returns only matching slug entries', async () => {
  await seedEntries(tmpFile);
  const entries = await getHistoryForSlug('example-com', tmpFile);
  expect(entries).toHaveLength(3);
  entries.forEach(e => expect(e.slug).toBe('example-com'));
});

test('getHistoryForSlug returns empty array for unknown slug', async () => {
  await seedEntries(tmpFile);
  const entries = await getHistoryForSlug('no-such-slug', tmpFile);
  expect(entries).toEqual([]);
});

test('getRecentHistory limits results', async () => {
  await seedEntries(tmpFile);
  const entries = await getRecentHistory('example-com', 2, tmpFile);
  expect(entries).toHaveLength(2);
  expect(entries[entries.length - 1].snapshot).toBe('c.png');
});

test('getChangedEntries returns only changed entries', async () => {
  await seedEntries(tmpFile);
  const entries = await getChangedEntries('example-com', tmpFile);
  expect(entries).toHaveLength(1);
  expect(entries[0].changed).toBe(true);
});

test('summariseHistory returns correct counts', async () => {
  await seedEntries(tmpFile);
  const summary = await summariseHistory('example-com', tmpFile);
  expect(summary.slug).toBe('example-com');
  expect(summary.totalRuns).toBe(3);
  expect(summary.totalChanges).toBe(1);
  expect(summary.lastChecked).toBe('2024-01-03T00:00:00Z');
});

test('summariseHistory handles empty history', async () => {
  const summary = await summariseHistory('ghost-slug', tmpFile);
  expect(summary.totalRuns).toBe(0);
  expect(summary.totalChanges).toBe(0);
  expect(summary.lastChecked).toBeNull();
});
