const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseCliArgs, runAlertCli } = require('./alertcli');
const { appendAlertLog, buildAlertEntry } = require('./alert');

function makeTempLog() {
  const p = path.join(os.tmpdir(), `alertcli-test-${Date.now()}.ndjson`);
  return p;
}

function capture(argv, logPath) {
  let out = '';
  const stream = { write: s => { out += s; } };
  runAlertCli(['--log', logPath, ...argv], stream);
  return out;
}

test('parseCliArgs defaults', () => {
  const args = parseCliArgs([]);
  expect(args.command).toBe('list');
  expect(args.triggered).toBe(false);
});

test('parseCliArgs parses --url and --triggered', () => {
  const args = parseCliArgs(['--url', 'https://example.com', '--triggered']);
  expect(args.url).toBe('https://example.com');
  expect(args.triggered).toBe(true);
});

test('list shows no entries message when log empty', () => {
  const logPath = makeTempLog();
  const out = capture(['list'], logPath);
  expect(out).toContain('No alert entries found');
});

test('list shows entries from log', () => {
  const logPath = makeTempLog();
  appendAlertLog(logPath, buildAlertEntry('https://example.com', 0.1));
  const out = capture(['list'], logPath);
  expect(out).toContain('https://example.com');
  fs.unlinkSync(logPath);
});

test('--triggered filters to only triggered entries', () => {
  const logPath = makeTempLog();
  appendAlertLog(logPath, buildAlertEntry('https://a.com', 0.01)); // below threshold
  appendAlertLog(logPath, buildAlertEntry('https://b.com', 0.9));  // above threshold
  const out = capture(['list', '--triggered'], logPath);
  expect(out).toContain('https://b.com');
  expect(out).not.toContain('https://a.com');
  fs.unlinkSync(logPath);
});

test('summary command outputs counts', () => {
  const logPath = makeTempLog();
  appendAlertLog(logPath, buildAlertEntry('https://a.com', 0.01));
  appendAlertLog(logPath, buildAlertEntry('https://b.com', 0.9));
  const out = capture(['summary'], logPath);
  expect(out).toContain('Total entries: 2');
  expect(out).toContain('Triggered alerts: 1');
  fs.unlinkSync(logPath);
});

test('unknown command prints error', () => {
  const logPath = makeTempLog();
  const out = capture(['foobar'], logPath);
  expect(out).toContain('Unknown command');
});
