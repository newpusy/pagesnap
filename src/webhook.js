// webhook.js — send HTTP POST notifications when visual changes are detected

const https = require('https');
const http = require('http');
const { URL } = require('url');

function mergeWebhookConfig(global = {}, page = {}) {
  return {
    enabled: page.webhookEnabled ?? global.webhookEnabled ?? false,
    url: page.webhookUrl ?? global.webhookUrl ?? null,
    secret: page.webhookSecret ?? global.webhookSecret ?? null,
    retries: page.webhookRetries ?? global.webhookRetries ?? 2,
  };
}

function buildWebhookPayload(entry) {
  return JSON.stringify({
    event: 'visual_change',
    url: entry.url,
    slug: entry.slug,
    timestamp: entry.timestamp,
    diffScore: entry.diffScore ?? null,
    snapshot: entry.snapshotPath ?? null,
  });
}

function sendWebhook(webhookUrl, payload, secret) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(webhookUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Pagesnap-Event': 'visual_change',
    };
    if (secret) headers['X-Pagesnap-Secret'] = secret;

    const req = lib.request(
      { hostname: parsed.hostname, port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function dispatchWebhook(config, entry) {
  const { enabled, url, secret, retries } = mergeWebhookConfig(config);
  if (!enabled || !url) return { skipped: true };

  const payload = buildWebhookPayload(entry);
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await sendWebhook(url, payload, secret);
      return { sent: true, attempt: attempt + 1, status: result.status };
    } catch (err) {
      lastError = err;
    }
  }
  return { sent: false, error: lastError?.message ?? 'unknown error' };
}

module.exports = { mergeWebhookConfig, buildWebhookPayload, sendWebhook, dispatchWebhook };
