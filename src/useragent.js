// useragent.js — Manage custom User-Agent strings for page captures

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; Pagesnap/1.0; +https://github.com/pagesnap)';

const PRESETS = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  firefox:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  mobile:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
  bot: 'Pagesnap/1.0 (screenshot bot)',
};

function mergeUserAgentConfig(global = {}, page = {}) {
  const base = global.userAgent ?? null;
  const override = page.userAgent ?? null;
  return override ?? base ?? null;
}

function resolveUserAgent(raw) {
  if (!raw) return DEFAULT_USER_AGENT;
  const preset = PRESETS[raw.toLowerCase()];
  return preset ?? raw;
}

function validateUserAgent(ua) {
  if (typeof ua !== 'string') return { valid: false, reason: 'must be a string' };
  if (ua.trim().length === 0) return { valid: false, reason: 'must not be empty' };
  if (ua.length > 512) return { valid: false, reason: 'exceeds 512 character limit' };
  return { valid: true };
}

function describeUserAgent(ua) {
  const resolved = resolveUserAgent(ua);
  const isPreset = ua && PRESETS[ua.toLowerCase()];
  return isPreset
    ? `preset(${ua.toLowerCase()}): ${resolved}`
    : `custom: ${resolved}`;
}

module.exports = {
  DEFAULT_USER_AGENT,
  PRESETS,
  mergeUserAgentConfig,
  resolveUserAgent,
  validateUserAgent,
  describeUserAgent,
};
