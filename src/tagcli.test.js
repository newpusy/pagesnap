// tagcli.test.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const { addTag, removeTag, listTags, parseCliArgs } = require('./tagcli');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tagcli-'));
  process.env.TAGS_FILE = path.join(tmpDir, 'tags.json');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.TAGS_FILE;
  jest.resetModules();
});

test('addTag creates a new tag entry', () => {
  const result = addTag('snap-001.png', 'baseline');
  expect(result).toContain('baseline');
});

test('addTag does not duplicate tags', () => {
  addTag('snap-001.png', 'baseline');
  const result = addTag('snap-001.png', 'baseline');
  expect(result.filter(t => t === 'baseline').length).toBe(1);
});

test('addTag supports multiple tags per file', () => {
  addTag('snap-001.png', 'baseline');
  const result = addTag('snap-001.png', 'reviewed');
  expect(result).toEqual(['baseline', 'reviewed']);
});

test('removeTag removes an existing tag', () => {
  addTag('snap-002.png', 'draft');
  const result = removeTag('snap-002.png', 'draft');
  expect(result).not.toContain('draft');
});

test('removeTag on missing file returns empty array', () => {
  const result = removeTag('nonexistent.png', 'anything');
  expect(result).toEqual([]);
});

test('listTags returns all tags when no file given', () => {
  addTag('a.png', 'foo');
  addTag('b.png', 'bar');
  const result = listTags();
  expect(result['a.png']).toContain('foo');
  expect(result['b.png']).toContain('bar');
});

test('listTags returns tags for specific file', () => {
  addTag('c.png', 'checked');
  const result = listTags('c.png');
  expect(result).toContain('checked');
});

test('listTags returns empty array for untagged file', () => {
  expect(listTags('unknown.png')).toEqual([]);
});

test('addTag throws if file or tag is missing', () => {
  expect(() => addTag('', 'tag')).toThrow();
  expect(() => addTag('file.png', '')).toThrow();
});

test('parseCliArgs extracts command and args', () => {
  const result = parseCliArgs(['node', 'tagcli.js', 'add', 'snap.png', 'baseline']);
  expect(result.command).toBe('add');
  expect(result.args).toEqual(['snap.png', 'baseline']);
});
