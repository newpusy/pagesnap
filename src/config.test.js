const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadConfig, validateConfig, mergeConfig, DEFAULT_CONFIG } = require('./config');

function writeTempConfig(data) {
  const tmpPath = path.join(os.tmpdir(), `pagesnap-test-${Date.now()}.json`);
  fs.writeFileSync(tmpPath, JSON.stringify(data));
  return tmpPath;
}

describe('validateConfig', () => {
  test('throws if pages is missing', () => {
    expect(() => validateConfig({})).toThrow('non-empty "pages" array');
  });

  test('throws if pages is empty', () => {
    expect(() => validateConfig({ pages: [] })).toThrow('non-empty "pages" array');
  });

  test('throws if a page has no url', () => {
    expect(() => validateConfig({ pages: [{ name: 'home' }] })).toThrow('must have a "url" field');
  });

  test('throws on invalid url', () => {
    expect(() => validateConfig({ pages: [{ url: 'not-a-url' }] })).toThrow('Invalid URL');
  });

  test('passes with valid config', () => {
    expect(() => validateConfig({ pages: [{ url: 'https://example.com' }] })).not.toThrow();
  });
});

describe('mergeConfig', () => {
  test('uses defaults when no overrides', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { pages: [] });
    expect(result.schedule).toBe(DEFAULT_CONFIG.schedule);
    expect(result.viewport.width).toBe(1280);
  });

  test('overrides top-level fields', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { pages: [], schedule: '*/5 * * * *' });
    expect(result.schedule).toBe('*/5 * * * *');
  });

  test('deep merges viewport', () => {
    const result = mergeConfig(DEFAULT_CONFIG, { pages: [], viewport: { width: 1920 } });
    expect(result.viewport.width).toBe(1920);
    expect(result.viewport.height).toBe(800);
  });
});

describe('loadConfig', () => {
  test('throws if file does not exist', () => {
    expect(() => loadConfig('/nonexistent/path.json')).toThrow('not found');
  });

  test('throws on invalid JSON', () => {
    const tmpPath = path.join(os.tmpdir(), `pagesnap-bad-${Date.now()}.json`);
    fs.writeFileSync(tmpPath, 'not json');
    expect(() => loadConfig(tmpPath)).toThrow('Failed to parse');
    fs.unlinkSync(tmpPath);
  });

  test('loads and merges valid config', () => {
    const tmpPath = writeTempConfig({ pages: [{ url: 'https://example.com' }], diffThreshold: 0.5 });
    const config = loadConfig(tmpPath);
    expect(config.pages[0].url).toBe('https://example.com');
    expect(config.diffThreshold).toBe(0.5);
    expect(config.outputDir).toBe('./snapshots');
    fs.unlinkSync(tmpPath);
  });
});
