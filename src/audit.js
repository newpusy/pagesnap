// audit.js — tracks a running log of all snapshot capture events

const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_PATH = path.resolve('data/audit.ndjson');

function buildAuditEntry({ url, slug, status, snapshotPath, error, durationMs }) {
  return {
    ts: new Date().toISOString(),
    url,
    slug,
    status, // 'ok' | 'error' | 'skipped'
    snapshotPath: snapshotPath || null,
    error: error || null,
    durationMs: durationMs || null,
  };
}

function appendAuditEntry(entry, auditPath = DEFAULT_AUDIT_PATH) {
  const dir = path.dirname(auditPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(auditPath, line, 'utf8');
}

function readAuditEntries(auditPath = DEFAULT_AUDIT_PATH) {
  if (!fs.existsSync(auditPath)) return [];
  const raw = fs.readFileSync(auditPath, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').map(line => JSON.parse(line));
}

function filterAuditEntries(entries, { status, slug, since } = {}) {
  return entries.filter(e => {
    if (status && e.status !== status) return false;
    if (slug && e.slug !== slug) return false;
    if (since && new Date(e.ts) < new Date(since)) return false;
    return true;
  });
}

function summariseAudit(entries) {
  const total = entries.length;
  const ok = entries.filter(e => e.status === 'ok').length;
  const errors = entries.filter(e => e.status === 'error').length;
  const skipped = entries.filter(e => e.status === 'skipped').length;
  const durations = entries.map(e => e.durationMs).filter(Boolean);
  const avgMs = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;
  return { total, ok, errors, skipped, avgMs };
}

module.exports = {
  buildAuditEntry,
  appendAuditEntry,
  readAuditEntries,
  filterAuditEntries,
  summariseAudit,
};
