// auditcli.js — CLI helpers for querying the audit log

const { readAuditEntries, filterAuditEntries, summariseAudit } = require('./audit');
const path = require('path');

const DEFAULT_AUDIT_PATH = path.resolve('data/audit.ndjson');

function parseCliArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--status') args.status = argv[++i];
    else if (argv[i] === '--slug') args.slug = argv[++i];
    else if (argv[i] === '--since') args.since = argv[++i];
    else if (argv[i] === '--summary') args.summary = true;
    else if (argv[i] === '--file') args.file = argv[++i];
  }
  return args;
}

function runAuditCli(argv = process.argv.slice(2), out = console.log) {
  const args = parseCliArgs(argv);
  const auditPath = args.file || DEFAULT_AUDIT_PATH;
  let entries = readAuditEntries(auditPath);

  const filters = {};
  if (args.status) filters.status = args.status;
  if (args.slug) filters.slug = args.slug;
  if (args.since) filters.since = args.since;

  if (Object.keys(filters).length) {
    entries = filterAuditEntries(entries, filters);
  }

  if (args.summary) {
    const s = summariseAudit(entries);
    out(`total=${s.total} ok=${s.ok} errors=${s.errors} skipped=${s.skipped} avgMs=${s.avgMs ?? 'n/a'}`);
  } else {
    if (entries.length === 0) {
      out('no audit entries found');
    } else {
      entries.forEach(e => out(JSON.stringify(e)));
    }
  }
}

module.exports = { parseCliArgs, runAuditCli };
