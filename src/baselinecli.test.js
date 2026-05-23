const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseCliArgs, resolveBaselineDir, runBaselineCli } = require('./baselinecli');
const { setBaseline } = require('./baseline');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'baselinecli-test-'));
}

describe('parseCliArgs', () => {
  test('parses command and slug', () => {
    expect(parseCliArgs(['set', 'example-com'])).toEqual({ command: 'set', slug: 'example-com' });
  });
  test('handles missing slug', () => {
    expect(parseCliArgs(['list'])).toEqual({ command: 'list', slug: undefined });
  });
});

describe('resolveBaselineDir', () => {
  test('uses config value', () => {
    expect(resolveBaselineDir({ baselineDir: '/tmp/bl' })).toBe('/tmp/bl');
  });
  test('falls back to default', () => {
    expect(resolveBaselineDir({})).toBe('baselines');
  });
});

describe('runBaselineCli', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  function capture() {
    const lines = [];
    return { log: (l) => lines.push(l), lines };
  }

  test('list shows no baselines message', async () => {
    const { log, lines } = capture();
    await runBaselineCli(['list'], log);
    expect(lines.some(l => l.includes('No baselines'))).toBe(true);
  });

  test('check reports missing baseline', async () => {
    const { log, lines } = capture();
    await runBaselineCli(['check', 'ghost-slug'], log);
    expect(lines[0]).toContain('No baseline');
  });

  test('clear reports not found', async () => {
    const { log, lines } = capture();
    await runBaselineCli(['clear', 'ghost-slug'], log);
    expect(lines[0]).toContain('No baseline found');
  });

  test('unknown command logs error', async () => {
    const { log, lines } = capture();
    await runBaselineCli(['explode', 'x'], log);
    expect(lines[0]).toContain('Unknown command');
  });

  test('missing slug shows usage', async () => {
    const { log, lines } = capture();
    await runBaselineCli(['set'], log);
    expect(lines[0]).toContain('Usage');
  });
});
