// proxycli.js — CLI to test and inspect proxy configuration

const { loadConfig } = require('./config');
const { mergeProxyConfig, buildProxyArgs, isProxyEnabled } = require('./proxy');

function parseCliArgs(argv = process.argv.slice(2)) {
  const args = { page: null, command: 'show' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--page' && argv[i + 1]) {
      args.page = argv[++i];
    } else if (['show', 'test'].includes(argv[i])) {
      args.command = argv[i];
    }
  }
  return args;
}

async function runProxyCli(argv, configPath = 'pagesnap.config.json', out = console.log) {
  const args = parseCliArgs(argv);
  const config = await loadConfig(configPath);

  let pageConfig = {};
  if (args.page) {
    const pages = config.pages || [];
    const found = pages.find(p => p.url === args.page || p.slug === args.page);
    if (!found) {
      out(`Page not found: ${args.page}`);
      return;
    }
    pageConfig = found;
  }

  const proxyConfig = mergeProxyConfig(config, pageConfig);

  if (args.command === 'show') {
    out('Proxy configuration:');
    out(`  enabled:            ${proxyConfig.enabled}`);
    out(`  url:                ${proxyConfig.url || '(none)'}`);
    out(`  bypass:             ${proxyConfig.bypass.length ? proxyConfig.bypass.join(', ') : '(none)'}`);
    out(`  rejectUnauthorized: ${proxyConfig.rejectUnauthorized}`);
    if (isProxyEnabled(proxyConfig)) {
      const launchArgs = buildProxyArgs(proxyConfig);
      out(`  chromium args:      ${launchArgs.join(' ')}`);
    }
    return;
  }

  if (args.command === 'test') {
    if (!isProxyEnabled(proxyConfig)) {
      out('Proxy is not enabled.');
      return;
    }
    out(`Testing proxy: ${proxyConfig.url}`);
    out('Proxy config looks valid. Run a capture to verify connectivity.');
  }
}

module.exports = { parseCliArgs, runProxyCli };
