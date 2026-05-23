// alert.js — threshold-based alerting for visual diff changes

const fs = require('fs');
const path = require('path');

const DEFAULT_ALERT_CONFIG = {
  threshold: 0.05,       // fraction of pixels changed to trigger alert
  cooldownMinutes: 60,   // minimum minutes between repeated alerts for same url
  enabled: true
};

function mergeAlertConfig(userConfig = {}) {
  return Object.assign({}, DEFAULT_ALERT_CONFIG, userConfig);
}

function isAboveThreshold(diffRatio, threshold) {
  if (typeof diffRatio !== 'number' || diffRatio < 0) return false;
  return diffRatio > threshold;
}

function buildAlertEntry(url, diffRatio, config = {}) {
  const merged = mergeAlertConfig(config);
  return {
    url,
    diffRatio,
    threshold: merged.threshold,
    triggered: isAboveThreshold(diffRatio, merged.threshold),
    timestamp: new Date().toISOString()
  };
}

function appendAlertLog(logPath, entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(logPath, line, 'utf8');
}

function readAlertLog(logPath) {
  if (!fs.existsSync(logPath)) return [];
  return fs.readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));
}

function getLastAlertTime(logPath, url) {
  const entries = readAlertLog(logPath);
  const matches = entries.filter(e => e.url === url && e.triggered);
  if (!matches.length) return null;
  return new Date(matches[matches.length - 1].timestamp);
}

function isCooledDown(logPath, url, cooldownMinutes) {
  const last = getLastAlertTime(logPath, url);
  if (!last) return true;
  const diffMs = Date.now() - last.getTime();
  return diffMs >= cooldownMinutes * 60 * 1000;
}

module.exports = {
  mergeAlertConfig,
  isAboveThreshold,
  buildAlertEntry,
  appendAlertLog,
  readAlertLog,
  getLastAlertTime,
  isCooledDown
};
