const fs = require('fs');
const path = require('path');
const os = require('os');
const { listSnapshotFiles, pruneSnapshots, pruneAll } = require('./cleaner');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-cleaner-'));
}

function seedSnapshots(base, slug, count) {
  const dir = path.join(base, slug);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (let i = 0; i < count; i++) {
    const name = `2024-01-01T00-00-0${i}.png`;
    const fp = path.join(dir, name);
    fs.writeFileSync(fp, Buffer.alloc(4, i));
    files.push(fp);
  }
  return files;
}

describe('listSnapshotFiles', () => {
  it('returns empty array when slug dir does not exist', () => {
    const base = makeTempDir();
    expect(listSnapshotFiles(base, 'missing')).toEqual([]);
  });

  it('returns sorted png paths', () => {
    const base = makeTempDir();
    const seeded = seedSnapshots(base, 'example-com', 3);
    const result = listSnapshotFiles(base, 'example-com');
    expect(result).toEqual(seeded.sort());
  });
});

describe('pruneSnapshots', () => {
  it('throws if keepLast < 1', () => {
    const base = makeTempDir();
    expect(() => pruneSnapshots(base, 'x', 0)).toThrow('keepLast must be >= 1');
  });

  it('deletes oldest files beyond keepLast', () => {
    const base = makeTempDir();
    seedSnapshots(base, 'site', 5);
    const deleted = pruneSnapshots(base, 'site', 2);
    expect(deleted).toHaveLength(3);
    expect(listSnapshotFiles(base, 'site')).toHaveLength(2);
    deleted.forEach(f => expect(fs.existsSync(f)).toBe(false));
  });

  it('does nothing when count <= keepLast', () => {
    const base = makeTempDir();
    seedSnapshots(base, 'site', 2);
    const deleted = pruneSnapshots(base, 'site', 5);
    expect(deleted).toHaveLength(0);
    expect(listSnapshotFiles(base, 'site')).toHaveLength(2);
  });
});

describe('pruneAll', () => {
  it('returns empty array when snapshotDir does not exist', () => {
    expect(pruneAll('/nonexistent/path', 3)).toEqual([]);
  });

  it('prunes all slugs and reports results', () => {
    const base = makeTempDir();
    seedSnapshots(base, 'alpha', 4);
    seedSnapshots(base, 'beta', 2);
    const results = pruneAll(base, 2);
    const alpha = results.find(r => r.slug === 'alpha');
    const beta = results.find(r => r.slug === 'beta');
    expect(alpha.deleted).toHaveLength(2);
    expect(beta.deleted).toHaveLength(0);
  });
});
