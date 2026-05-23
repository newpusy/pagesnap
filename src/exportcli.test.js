// exportcli.test.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseCliArgs, entriesToCsv, runExportCli } = require('./exportcli');

const SAMPLE_ENTRIES = [
  { url: 'https://example.com', timestamp: '2024-01-01T00:00:00Z', changed: true, snapshot: 'snap1.png' },
  { url: 'https://other.com', timestamp: '2024-01-02T00:00:00Z', changed: false, snapshot: 'snap2.png' },
];

function makeTempReport(entries = SAMPLE_ENTRIES) {
  const file = path.join(os.tmpdir(), `report-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(entries), 'utf8');
  return file;
}

test('parseCliArgs defaults', () => {
  const args = parseCliArgs([]);
  expect(args.format).toBe('json');
  expect(args.output).toBeNull();
  expect(args.url).toBeNull();
});

test('parseCliArgs parses all flags', () => {
  const args = parseCliArgs(['--format', 'csv', '--output', 'out.csv', '--url', 'https://example.com']);
  expect(args.format).toBe('csv');
  expect(args.output).toBe('out.csv');
  expect(args.url).toBe('https://example.com');
});

test('entriesToCsv returns empty string for no entries', () => {
  expect(entriesToCsv([])).toBe('');
});

test('entriesToCsv produces correct headers and rows', () => {
  const csv = entriesToCsv(SAMPLE_ENTRIES);
  const lines = csv.split('\n');
  expect(lines[0]).toBe('url,timestamp,changed,snapshot');
  expect(lines[1]).toContain('https://example.com');
  expect(lines.length).toBe(3);
});

test('entriesToCsv wraps values with commas in quotes', () => {
  const entries = [{ url: 'a,b', timestamp: '2024-01-01T00:00:00Z', changed: false, snapshot: 'x.png' }];
  const csv = entriesToCsv(entries);
  expect(csv).toContain('"a,b"');
});

test('runExportCli writes json to output file', () => {
  const reportFile = makeTempReport();
  const outFile = path.join(os.tmpdir(), `export-${Date.now()}.json`);
  runExportCli(['--format', 'json', '--output', outFile], reportFile);
  const data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  expect(data.length).toBe(2);
  fs.unlinkSync(reportFile);
  fs.unlinkSync(outFile);
});

test('runExportCli filters by url', () => {
  const reportFile = makeTempReport();
  const outFile = path.join(os.tmpdir(), `export-${Date.now()}.json`);
  runExportCli(['--format', 'json', '--output', outFile, '--url', 'https://example.com'], reportFile);
  const data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  expect(data.length).toBe(1);
  expect(data[0].url).toBe('https://example.com');
  fs.unlinkSync(reportFile);
  fs.unlinkSync(outFile);
});

test('runExportCli writes csv to output file', () => {
  const reportFile = makeTempReport();
  const outFile = path.join(os.tmpdir(), `export-${Date.now()}.csv`);
  runExportCli(['--format', 'csv', '--output', outFile], reportFile);
  const content = fs.readFileSync(outFile, 'utf8');
  expect(content).toContain('url,timestamp,changed,snapshot');
  fs.unlinkSync(reportFile);
  fs.unlinkSync(outFile);
});
