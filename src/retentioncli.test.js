const path = require('path');
const fs = require('fs');
const os = require('os');
const { parseCliArgs, getSlugs } = require('./retentioncli');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-retcli-'));
}

describe('parseCliArgs', () => {
  test('defaults to pagesnap.config.json and no dry-run', () => {
    const args = parseCliArgs([]);
    expect(args.dryRun).toBe(false);
    expect(args.configPath).toBe('pagesnap.config.json');
  });

  test('detects --dry-run flag', () => {
    const args = parseCliArgs(['--dry-run']);
    expect(args.dryRun).toBe(true);
  });

  test('reads --config path', () => {
    const args = parseCliArgs(['--config', 'custom.config.json']);
    expect(args.configPath).toBe('custom.config.json');
  });

  test('handles both flags together', () => {
    const args = parseCliArgs(['--dry-run', '--config', 'other.json']);
    expect(args.dryRun).toBe(true);
    expect(args.configPath).toBe('other.json');
  });
});

describe('getSlugs', () => {
  test('returns empty array if dir does not exist', () => {
    expect(getSlugs('/nonexistent/path')).toEqual([]);
  });

  test('returns subdirectory names', () => {
    const dir = makeTempDir();
    fs.mkdirSync(path.join(dir, 'example-com'));
    fs.mkdirSync(path.join(dir, 'other-com'));
    fs.writeFileSync(path.join(dir, 'notadir.txt'), 'x');
    const slugs = getSlugs(dir);
    expect(slugs).toContain('example-com');
    expect(slugs).toContain('other-com');
    expect(slugs).not.toContain('notadir.txt');
  });

  test('returns empty array for empty snapshot dir', () => {
    const dir = makeTempDir();
    expect(getSlugs(dir)).toEqual([]);
  });
});
