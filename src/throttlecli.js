// throttlecli.js — CLI to test throttle config for a given page slug

const path = require('path');
const { loadConfig } = require('./config');
const { mergeThrottleConfig } = require('./throttle');

function parseCliArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config' && argv[i + 1]) args.config = argv[++i];
    if (argv[i] === '--slug' && argv[i + 1]) args.slug = argv[++i];
  }
  return args;
}

async function runThrottleCli(argv, out = console.log) {
  const args = parseCliArgs(argv);
  const configPath = args.config
    ? path.resolve(args.config)
    : path.resolve('pagesnap.config.json');

  let config;
  try {
    config = await loadConfig(configPath);
  } catch (e) {
    out(`Error loading config: ${e.message}`);
    return;
  }

  const globalThrottle = config.throttle || {};

  if (args.slug) {
    const page = (config.pages || []).find((p) => p.slug === args.slug || p.url.includes(args.slug));
    if (!page) {
      out(`No page found matching slug: ${args.slug}`);
      return;
    }
    const merged = mergeThrottleConfig(globalThrottle, page.throttle || {});
    out(`Throttle config for ${page.url}:`);
    out(JSON.stringify(merged, null, 2));
  } else {
    const merged = mergeThrottleConfig(globalThrottle);
    out('Global throttle config:');
    out(JSON.stringify(merged, null, 2));
  }
}

if (require.main === module) {
  runThrottleCli(process.argv.slice(2));
}

module.exports = { parseCliArgs, runThrottleCli };
