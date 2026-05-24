// Custom HTTP headers support for page captures
// Allows setting auth tokens, user-agent overrides, etc.

/**
 * Merge default headers with page-level overrides
 * @param {object} globalHeaders - from top-level config
 * @param {object} pageHeaders - from individual page config
 * @returns {object}
 */
function mergeHeaders(globalHeaders = {}, pageHeaders = {}) {
  return { ...globalHeaders, ...pageHeaders };
}

/**
 * Validate a headers object — keys and values must be strings
 * @param {object} headers
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateHeaders(headers = {}) {
  const errors = [];
  for (const [key, value] of Object.entries(headers)) {
    if (typeof key !== 'string' || key.trim() === '') {
      errors.push(`Invalid header key: ${JSON.stringify(key)}`);
    }
    if (typeof value !== 'string') {
      errors.push(`Header "${key}" value must be a string, got ${typeof value}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Apply headers to a Puppeteer page instance
 * @param {object} page - Puppeteer page
 * @param {object} headers
 */
async function applyHeaders(page, headers = {}) {
  if (Object.keys(headers).length === 0) return;
  await page.setExtraHTTPHeaders(headers);
}

/**
 * Build a summary string for logging
 * @param {object} headers
 * @returns {string}
 */
function describeHeaders(headers = {}) {
  const keys = Object.keys(headers);
  if (keys.length === 0) return 'no custom headers';
  return `${keys.length} header(s): ${keys.join(', ')}`;
}

module.exports = { mergeHeaders, validateHeaders, applyHeaders, describeHeaders };
