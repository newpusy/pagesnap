const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseCliArgs, runThrottleCli } = require('./throttlecli');

function makeTempConfig(data) {
  const p = path.join(os.tmpdir(), `throttlecli-test-${Date.now()}.json`);
  fs.writeFileSync(p, JSON.stringify(data));
  return p;
}

describe('parseCliArgs', () => {
  test('parses --config and --slug', () => {
    const args = parseCliArgs(['--config', 'my.json', '--slug', 'example']);
    expect(args.config).toBe('my.json');
    expect(args.slug).toBe('example');
  });

  test('returns empty object for no args', () => {
    expect(parseCliArgs([])).toEqual({});
  });
});

describe('runThrottleCli', () => {
  test('prints global throttle config', async () => {
    const cfg = makeTempConfig({ throttle: { delayMs: 100, maxRetries: 1 }, pages: [] });
    const lines = [];
    await runThrottleCli(['--config', cfg], (l) => lines.push(l));
    expect(lines.some((l) => l.includes('Global throttle config'))).toBe(true);
    const json = JSON.parse(lines.slice(1).join(''));
    expect(json.delayMs).toBe(100);
    expect(json.maxRetries).toBe(1);
    fs.unlinkSync(cfg);
  });

  test('prints per-page throttle config when slug matches', async () => {
    const cfg = makeTempConfig({
      throttle: { delayMs: 0 },
      pages: [{ url: 'https://example.com', slug: 'example', throttle: { delayMs: 500 } }],
    });
    const lines = [];
    await runThrottleCli(['--config', cfg, '--slug', 'example'], (l) => lines.push(l));
    const json = JSON.parse(lines.slice(1).join(''));
    expect(json.delayMs).toBe(500);
    fs.unlinkSync(cfg);
  });

  test('prints error when slug not found', async () => {
    const cfg = makeTempConfig({ pages: [] });
    const lines = [];
    await runThrottleCli(['--config', cfg, '--slug', 'missing'], (l) => lines.push(l));
    expect(lines[0]).toMatch(/No page found/);
    fs.unlinkSync(cfg);
  });

  test('prints error when config missing', async () => {
    const lines = [];
    await runThrottleCli(['--config', '/nonexistent/path.json'], (l) => lines.push(l));
    expect(lines[0]).toMatch(/Error loading config/);
  });
});
