// webhook.test.js

const { mergeWebhookConfig, buildWebhookPayload, dispatchWebhook } = require('./webhook');

describe('mergeWebhookConfig', () => {
  test('uses page-level overrides over global', () => {
    const result = mergeWebhookConfig(
      { webhookEnabled: false, webhookUrl: 'http://global.example.com', webhookRetries: 1 },
      { webhookEnabled: true, webhookUrl: 'http://page.example.com' }
    );
    expect(result.enabled).toBe(true);
    expect(result.url).toBe('http://page.example.com');
    expect(result.retries).toBe(1);
  });

  test('falls back to defaults when nothing provided', () => {
    const result = mergeWebhookConfig();
    expect(result.enabled).toBe(false);
    expect(result.url).toBeNull();
    expect(result.retries).toBe(2);
    expect(result.secret).toBeNull();
  });

  test('global values used when no page overrides', () => {
    const result = mergeWebhookConfig({ webhookEnabled: true, webhookUrl: 'http://x.com', webhookSecret: 'abc' });
    expect(result.enabled).toBe(true);
    expect(result.secret).toBe('abc');
  });
});

describe('buildWebhookPayload', () => {
  test('includes required fields', () => {
    const entry = { url: 'https://example.com', slug: 'example-com', timestamp: '2024-01-01T00:00:00Z', diffScore: 0.42 };
    const raw = buildWebhookPayload(entry);
    const parsed = JSON.parse(raw);
    expect(parsed.event).toBe('visual_change');
    expect(parsed.url).toBe('https://example.com');
    expect(parsed.slug).toBe('example-com');
    expect(parsed.diffScore).toBe(0.42);
  });

  test('handles missing optional fields gracefully', () => {
    const raw = buildWebhookPayload({ url: 'https://x.com', slug: 'x', timestamp: 't' });
    const parsed = JSON.parse(raw);
    expect(parsed.diffScore).toBeNull();
    expect(parsed.snapshot).toBeNull();
  });
});

describe('dispatchWebhook', () => {
  test('skips when disabled', async () => {
    const result = await dispatchWebhook({ webhookEnabled: false }, { url: 'x', slug: 'x', timestamp: 't' });
    expect(result.skipped).toBe(true);
  });

  test('skips when no url configured', async () => {
    const result = await dispatchWebhook({ webhookEnabled: true }, { url: 'x', slug: 'x', timestamp: 't' });
    expect(result.skipped).toBe(true);
  });

  test('returns sent:false with error message on network failure', async () => {
    const result = await dispatchWebhook(
      { webhookEnabled: true, webhookUrl: 'http://127.0.0.1:19999/hook', webhookRetries: 0 },
      { url: 'https://example.com', slug: 'example', timestamp: 't' }
    );
    expect(result.sent).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});
