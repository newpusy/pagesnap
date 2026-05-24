// throttle.js — per-URL delay and backoff between capture runs

const DEFAULT_DELAY_MS = 0;
const DEFAULT_BACKOFF_MS = 2000;
const DEFAULT_MAX_RETRIES = 3;

function mergeThrottleConfig(global = {}, local = {}) {
  return {
    delayMs: local.delayMs ?? global.delayMs ?? DEFAULT_DELAY_MS,
    backoffMs: local.backoffMs ?? global.backoffMs ?? DEFAULT_BACKOFF_MS,
    maxRetries: local.maxRetries ?? global.maxRetries ?? DEFAULT_MAX_RETRIES,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDelay(fn, delayMs) {
  if (delayMs > 0) await sleep(delayMs);
  return fn();
}

async function withRetry(fn, config = {}) {
  const { backoffMs = DEFAULT_BACKOFF_MS, maxRetries = DEFAULT_MAX_RETRIES } = config;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      const wait = backoffMs * attempt;
      await sleep(wait);
    }
  }
}

module.exports = { mergeThrottleConfig, sleep, withDelay, withRetry };
