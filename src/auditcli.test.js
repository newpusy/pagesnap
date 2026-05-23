const fs = require('fs');
const path = require('path');
const os = require('os');
const { appendAuditEntry, buildAuditEntry } = require('./audit');
const { parseCliArgs, runAuditCli } = require('./auditcli');

function makeTempAudit(entries) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-auditcli-'));
  const p = path.join(dir, 'audit.ndjson');
  entries.forEach(e => appendAuditEntry(e, p));
  return p;
}

describe('parseCliArgs', () => {
  it('parses all flags', () => {
    const args = parseCliArgs(['--status', 'ok', '--slug', 'foo', '--since', '2024-01-01', '--summary', '--file', '/tmp/x.ndjson']);
    expect(args).toMatchObject({
      status: 'ok', slug: 'foo', since: '2024-01-01', summary: true, file: '/tmp/x.ndjson'
    });
  });

  it('returns empty object for no flags', () => {
    expect(parseCliArgs([])).toEqual({});
  });
});

describe('runAuditCli', () => {
  it('prints entries as JSON lines', () => {
    const p = makeTempAudit([
      buildAuditEntry({ url: 'https://a.com', slug: 'a-com', status: 'ok' }),
    ]);
    const lines = [];
    runAuditCli(['--file', p], l => lines.push(l));
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]).slug).toBe('a-com');
  });

  it('prints summary with --summary', () => {
    const p = makeTempAudit([
      buildAuditEntry({ url: 'https://a.com', slug: 'a-com', status: 'ok', durationMs: 100 }),
      buildAuditEntry({ url: 'https://b.com', slug: 'b-com', status: 'error' }),
    ]);
    const lines = [];
    runAuditCli(['--file', p, '--summary'], l => lines.push(l));
    expect(lines[0]).toMatch(/total=2/);
    expect(lines[0]).toMatch(/ok=1/);
    expect(lines[0]).toMatch(/errors=1/);
  });

  it('filters by status', () => {
    const p = makeTempAudit([
      buildAuditEntry({ url: 'https://a.com', slug: 'a-com', status: 'ok' }),
      buildAuditEntry({ url: 'https://b.com', slug: 'b-com', status: 'error' }),
    ]);
    const lines = [];
    runAuditCli(['--file', p, '--status', 'error'], l => lines.push(l));
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]).status).toBe('error');
  });

  it('prints message when no entries found', () => {
    const p = makeTempAudit([]);
    const lines = [];
    runAuditCli(['--file', p], l => lines.push(l));
    expect(lines[0]).toMatch(/no audit entries/);
  });
});
