// ratelimit.js — per-url rate limiting to avoid hammering targets

const DEFAULT_MIN_INTERVAL_MS = 5000;
const DEFAULT_MAX_CONCURRENT = 2;

const lastRun = new Map();
let activeConcurrent = 0;

function mergeRateLimitConfig(global = {}, perUrl = {}) {
  return {
    minIntervalMs:
      perUrl.minIntervalMs ??
      global.minIntervalMs ??
      DEFAULT_MIN_INTERVAL_MS,
    maxConcurrent:
      perUrl.maxConcurrent ??
      global.maxConcurrent ??
      DEFAULT_MAX_CONCURRENT,
  };
}

function isRateLimited(slug, minIntervalMs) {
  if (!lastRun.has(slug)) return false;
  const elapsed = Date.now() - lastRun.get(slug);
  return elapsed < minIntervalMs;
}

function recordRun(slug) {
  lastRun.set(slug, Date.now());
}

function isConcurrencyLimited(maxConcurrent) {
  return activeConcurrent >= maxConcurrent;
}

function acquireSlot() {
  activeConcurrent++;
}

function releaseSlot() {
  if (activeConcurrent > 0) activeConcurrent--;
}

function getActiveCount() {
  return activeConcurrent;
}

function resetState() {
  lastRun.clear();
  activeConcurrent = 0;
}

module.exports = {
  mergeRateLimitConfig,
  isRateLimited,
  recordRun,
  isConcurrencyLimited,
  acquireSlot,
  releaseSlot,
  getActiveCount,
  resetState,
};
