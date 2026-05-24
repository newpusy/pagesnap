'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseCliArgs, runPageCli } = require('./pagecli');

function makeTempConfig(pages = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagecli-'));
  const cfgPath = path.join(dir, 'pagesnap.config.json');
  const reportPath = path.join(dir, 'report.ndjson');
  const baselineDir = path.join(dir, 'baselines');
  fs.mkdirSync(baselineDir, { recursive: true });
  fs.writeFileSync(cfgPath, JSON.stringify({
    pages,
    schedule: '0 * * * *',
    reportPath,
    baselineDir
  }));
  return { cfgPath, reportPath, baselineDir, dir };
}

describe('parseCliArgs', () => {
  test('splits command and args', () => {
    const result = parseCliArgs(['list']);
    expect(result.command).toBe('list');
    expect(result.args).toEqual([]);
  });

  test('captures extra args', () => {
    const result = parseCliArgs(['info', 'https://example.com']);
    expect(result.command).toBe('info');
    expect(result.args).toEqual(['https://example.com']);
  });
});

describe('runPageCli list', () => {
  test('prints no pages message when empty', async () => {
    const { cfgPath } = makeTempConfig([]);
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await runPageCli(['list'], cfgPath);
    console.log = orig;
    expect(logs.some(l => l.includes('No pages configured'))).toBe(true);
  });

  test('lists configured pages', async () => {
    const { cfgPath } = makeTempConfig([{ url: 'https://example.com' }]);
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await runPageCli(['list'], cfgPath);
    console.log = orig;
    expect(logs.some(l => l.includes('https://example.com'))).toBe(true);
  });
});

describe('runPageCli info', () => {
  test('shows info for a known page', async () => {
    const { cfgPath } = makeTempConfig([{ url: 'https://example.com' }]);
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await runPageCli(['info', 'https://example.com'], cfgPath);
    console.log = orig;
    expect(logs.some(l => l.includes('https://example.com'))).toBe(true);
    expect(logs.some(l => l.includes('Slug'))).toBe(true);
  });

  test('exits on missing url arg', async () => {
    const { cfgPath } = makeTempConfig([]);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(runPageCli(['info'], cfgPath)).rejects.toThrow('exit');
    mockExit.mockRestore();
  });
});
