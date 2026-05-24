// cookies.js — per-page cookie injection support

const fs = require('fs');

/**
 * Merge cookie config from global and page-level settings.
 * Page-level cookies override global ones by name.
 */
function mergeCookies(globalCookies = [], pageCookies = []) {
  const map = new Map();
  for (const c of globalCookies) map.set(c.name, c);
  for (const c of pageCookies) map.set(c.name, c);
  return Array.from(map.values());
}

/**
 * Validate a single cookie object. Must have name and value.
 */
function validateCookie(cookie) {
  if (!cookie || typeof cookie !== 'object') return false;
  if (typeof cookie.name !== 'string' || !cookie.name.trim()) return false;
  if (typeof cookie.value !== 'string') return false;
  return true;
}

/**
 * Validate an array of cookies. Returns list of error strings.
 */
function validateCookies(cookies) {
  if (!Array.isArray(cookies)) return ['cookies must be an array'];
  const errors = [];
  cookies.forEach((c, i) => {
    if (!validateCookie(c)) {
      errors.push(`cookie[${i}] must have a string name and value`);
    }
  });
  return errors;
}

/**
 * Inject cookies into a Puppeteer page.
 * Each cookie must have at least { name, value }.
 * Optional: domain, path, httpOnly, secure, sameSite.
 */
async function injectCookies(page, cookies = []) {
  if (!cookies.length) return;
  for (const cookie of cookies) {
    await page.setCookie(cookie);
  }
}

/**
 * Load cookies from a JSON file (array of cookie objects).
 */
function loadCookiesFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Cookie file must contain a JSON array');
  return parsed;
}

module.exports = { mergeCookies, validateCookie, validateCookies, injectCookies, loadCookiesFromFile };
