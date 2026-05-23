// alertcli.js — CLI to inspect and manage the alert log

const path = require('path');
const { readAlertLog } = require('./alert');

const DEFAULT_LOG = path.resolve('alerts.ndjson');

function parseCliArgs(argv = process.argv.slice(2)) {
  const args = { command: 'list', logPath: DEFAULT_LOG, url: null, triggered: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--log' && argv[i + 1]) args.logPath = argv[++i];
    else if (argv[i] === '--url' && argv[i + 1]) args.url = argv[++i];
    else if (argv[i] === '--triggered') args.triggered = true;
    else if (!argv[i].startsWith('--')) args.command = argv[i];
  }
  return args;
}

function runAlertCli(argv, out = process.stdout) {
  const args = parseCliArgs(argv);
  let entries = readAlertLog(args.logPath);

  if (args.url) {
    entries = entries.filter(e => e.url === args.url);
  }
  if (args.triggered) {
    entries = entries.filter(e => e.triggered);
  }

  if (args.command === 'list') {
    if (!entries.length) {
      out.write('No alert entries found.\n');
      return;
    }
    for (const e of entries) {
      const flag = e.triggered ? '[ALERT]' : '[ok]';
      out.write(`${flag} ${e.timestamp} ${e.url} diff=${(e.diffRatio * 100).toFixed(2)}%\n`);
    }
    return;
  }

  if (args.command === 'summary') {
    const total = entries.length;
    const triggered = entries.filter(e => e.triggered).length;
    out.write(`Total entries: ${total}\n`);
    out.write(`Triggered alerts: ${triggered}\n`);
    return;
  }

  out.write(`Unknown command: ${args.command}\n`);
}

module.exports = { parseCliArgs, runAlertCli };

if (require.main === module) {
  runAlertCli(process.argv.slice(2));
}
