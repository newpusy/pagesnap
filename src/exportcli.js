// exportcli.js — CLI tool to export snapshot report entries as JSON or CSV

const fs = require('fs');
const path = require('path');
const { readReportEntries } = require('./reporter');

function parseCliArgs(argv = process.argv.slice(2)) {
  const args = { format: 'json', output: null, url: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--format' && argv[i + 1]) args.format = argv[++i];
    else if (argv[i] === '--output' && argv[i + 1]) args.output = argv[++i];
    else if (argv[i] === '--url' && argv[i + 1]) args.url = argv[++i];
  }
  return args;
}

function entriesToCsv(entries) {
  if (!entries.length) return '';
  const headers = Object.keys(entries[0]).join(',');
  const rows = entries.map(e =>
    Object.values(e)
      .map(v => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
      .join(',')
  );
  return [headers, ...rows].join('\n');
}

function runExportCli(argv = process.argv.slice(2), reportFile = null) {
  const args = parseCliArgs(argv);
  const { format, output, url } = args;

  if (!['json', 'csv'].includes(format)) {
    console.error(`Unsupported format: ${format}. Use json or csv.`);
    process.exit(1);
  }

  let entries = readReportEntries(reportFile);

  if (url) {
    entries = entries.filter(e => e.url === url);
  }

  const content =
    format === 'csv' ? entriesToCsv(entries) : JSON.stringify(entries, null, 2);

  if (output) {
    fs.writeFileSync(output, content, 'utf8');
    console.log(`Exported ${entries.length} entries to ${output}`);
  } else {
    console.log(content);
  }
}

module.exports = { parseCliArgs, entriesToCsv, runExportCli };

if (require.main === module) {
  runExportCli();
}
