const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getBaselinePath,
  baselineExists,
  setBaseline,
  clearBaseline,
  listBaselines,
} = require('./baseline');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-test-'));
}

function makePng(filePath) {
  fs.writeFileSync(filePath, Buffer.from('PNG'));
}

describe('baseline', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('getBaselinePath returns correct path', () => {
    const p = getBaselinePath('example-com', tmpDir);
    expect(p).toBe(path.join(tmpDir, 'example-com.baseline.png'));
  });

  test('baselineExists returns false when missing', () => {
    expect(baselineExists('example-com', tmpDir)).toBe(false);
  });

  test('setBaseline copies file and returns dest path', () => {
    const src = path.join(tmpDir, 'snap.png');
    makePng(src);
    const dest = setBaseline('example-com', src, tmpDir);
    expect(fs.existsSync(dest)).toBe(true);
    expect(dest).toContain('example-com.baseline.png');
  });

  test('baselineExists returns true after setBaseline', () => {
    const src = path.join(tmpDir, 'snap.png');
    makePng(src);
    setBaseline('example-com', src, tmpDir);
    expect(baselineExists('example-com', tmpDir)).toBe(true);
  });

  test('setBaseline throws if source missing', () => {
    expect(() => setBaseline('x', '/no/such/file.png', tmpDir)).toThrow();
  });

  test('clearBaseline removes file and returns true', () => {
    const src = path.join(tmpDir, 'snap.png');
    makePng(src);
    setBaseline('example-com', src, tmpDir);
    expect(clearBaseline('example-com', tmpDir)).toBe(true);
    expect(baselineExists('example-com', tmpDir)).toBe(false);
  });

  test('clearBaseline returns false when no baseline', () => {
    expect(clearBaseline('ghost', tmpDir)).toBe(false);
  });

  test('listBaselines returns slugs', () => {
    const src = path.join(tmpDir, 'snap.png');
    makePng(src);
    setBaseline('site-one', src, tmpDir);
    setBaseline('site-two', src, tmpDir);
    const list = listBaselines(tmpDir);
    expect(list).toContain('site-one');
    expect(list).toContain('site-two');
  });

  test('listBaselines returns empty array when dir missing', () => {
    expect(listBaselines('/no/such/dir')).toEqual([]);
  });
});
