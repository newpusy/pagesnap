const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  buildAuditEntry,
  appendAuditEntry,
  readAuditEntries,
  filterAuditEntries,
  summariseAudit,
} = require('./audit');

function makeTempAudit() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-audit-'));
  return path.join(dir, 'audit.ndjson');
}

describe('buildAuditEntry', () => {
  it('includes required fields', () => {
    const entry = buildAuditEntry({ url: 'https://example.com', slug: 'example-com', status: 'ok', durationMs: 320 });
    expect(entry.url).toBe('https://example.com');
    expect(entry.status).toBe('ok');
    expect(entry.durationMs).toBe(320);
    expect(entry.ts).toBeTruthy();
    expect(entry.error).toBeNull();
  });

  it('captures error field', () => {
    const entry = buildAuditEntry({ url: 'https://x.com', slug: 'x-com', status: 'error', error: 'timeout' });
    expect(entry.error).toBe('timeout');
  });
});

describe('appendAuditEntry + readAuditEntries', () => {
  it('round-trips entries', () => {
    const p = makeTempAudit();
    const e1 = buildAuditEntry({ url: 'https://a.com', slug: 'a-com', status: 'ok' });
    const e2 = buildAuditEntry({ url: 'https://b.com', slug: 'b-com', status: 'error', error: 'net' });
    appendAuditEntry(e1, p);
    appendAuditEntry(e2, p);
    const entries = readAuditEntries(p);
    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe('a-com');
    expect(entries[1].status).toBe('error');
  });

  it('returns empty array when file missing', () => {
    expect(readAuditEntries('/tmp/nonexistent-audit-xyz.ndjson')).toEqual([]);
  });
});

describe('filterAuditEntries', () => {
  const entries = [
    { ts: '2024-01-01T00:00:00Z', slug: 'a', status: 'ok' },
    { ts: '2024-01-02T00:00:00Z', slug: 'b', status: 'error' },
    { ts: '2024-01-03T00:00:00Z', slug: 'a', status: 'error' },
  ];

  it('filters by status', () => {
    expect(filterAuditEntries(entries, { status: 'error' })).toHaveLength(2);
  });

  it('filters by slug', () => {
    expect(filterAuditEntries(entries, { slug: 'a' })).toHaveLength(2);
  });

  it('filters by since', () => {
    expect(filterAuditEntries(entries, { since: '2024-01-02T00:00:00Z' })).toHaveLength(2);
  });
});

describe('summariseAudit', () => {
  it('computes counts and avgMs', () => {
    const entries = [
      buildAuditEntry({ url: '', slug: '', status: 'ok', durationMs: 100 }),
      buildAuditEntry({ url: '', slug: '', status: 'ok', durationMs: 200 }),
      buildAuditEntry({ url: '', slug: '', status: 'error' }),
      buildAuditEntry({ url: '', slug: '', status: 'skipped' }),
    ];
    const s = summariseAudit(entries);
    expect(s.total).toBe(4);
    expect(s.ok).toBe(2);
    expect(s.errors).toBe(1);
    expect(s.skipped).toBe(1);
    expect(s.avgMs).toBe(150);
  });
});
