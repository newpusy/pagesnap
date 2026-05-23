const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  mergeAlertConfig,
  isAboveThreshold,
  buildAlertEntry,
  appendAlertLog,
  readAlertLog,
  getLastAlertTime,
  isCooledDown
} = require('./alert');

function makeTempLog() {
  return path.join(os.tmpdir(), `alert-test-${Date.now()}.ndjson`);
}

test('mergeAlertConfig fills defaults', () => {
  const cfg = mergeAlertConfig({});
  expect(cfg.threshold).toBe(0.05);
  expect(cfg.cooldownMinutes).toBe(60);
  expect(cfg.enabled).toBe(true);
});

test('mergeAlertConfig respects overrides', () => {
  const cfg = mergeAlertConfig({ threshold: 0.1, cooldownMinutes: 30 });
  expect(cfg.threshold).toBe(0.1);
  expect(cfg.cooldownMinutes).toBe(30);
});

test('isAboveThreshold returns true when ratio exceeds threshold', () => {
  expect(isAboveThreshold(0.1, 0.05)).toBe(true);
});

test('isAboveThreshold returns false when ratio is below threshold', () => {
  expect(isAboveThreshold(0.02, 0.05)).toBe(false);
});

test('isAboveThreshold returns false for invalid input', () => {
  expect(isAboveThreshold(-1, 0.05)).toBe(false);
  expect(isAboveThreshold('bad', 0.05)).toBe(false);
});

test('buildAlertEntry marks triggered correctly', () => {
  const entry = buildAlertEntry('https://example.com', 0.1, { threshold: 0.05 });
  expect(entry.triggered).toBe(true);
  expect(entry.url).toBe('https://example.com');
  expect(entry.diffRatio).toBe(0.1);
});

test('appendAlertLog and readAlertLog round-trip', () => {
  const logPath = makeTempLog();
  const entry = buildAlertEntry('https://example.com', 0.08);
  appendAlertLog(logPath, entry);
  const entries = readAlertLog(logPath);
  expect(entries).toHaveLength(1);
  expect(entries[0].url).toBe('https://example.com');
  fs.unlinkSync(logPath);
});

test('readAlertLog returns empty array when file missing', () => {
  expect(readAlertLog('/tmp/nonexistent-alert.ndjson')).toEqual([]);
});

test('isCooledDown returns true when no prior alerts', () => {
  const logPath = makeTempLog();
  expect(isCooledDown(logPath, 'https://example.com', 60)).toBe(true);
});

test('isCooledDown returns false when recent alert exists', () => {
  const logPath = makeTempLog();
  const entry = buildAlertEntry('https://example.com', 0.1);
  appendAlertLog(logPath, entry);
  expect(isCooledDown(logPath, 'https://example.com', 60)).toBe(false);
  fs.unlinkSync(logPath);
});
