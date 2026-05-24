/**
 * proxycli.js — CLI interface for managing proxy configuration in pagesnap
 */

const VALID_COMMANDS = ['show', 'set', 'clear'];

/**
 * Parse CLI arguments for the proxy subcommand.
 * @param {string[]} argv - process.argv slice after 'proxy'
 * @returns {object} parsed result
 */
export function parseCliArgs(argv = []) {
  const [command = 'show', ...rest] = argv;

  if (!VALID_COMMANDS.includes(command)) {
    return { error: `Unknown command: "${command}". Valid commands: ${VALID_COMMANDS.join(', ')}` };
  }

  if (command === 'show' || command === 'clear') {
    return { command };
  }

  // command === 'set'
  const result = { command };
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    const value = rest[i + 1];
    if (flag === '--server') { result.server = value; i++; }
    else if (flag === '--port') { result.port = parseInt(value, 10); i++; }
    else if (flag === '--username') { result.username = value; i++; }
    else if (flag === '--password') { result.password = value; i++; }
    else if (flag === '--bypass') {
      result.bypass = value ? value.split(',').map(s => s.trim()) : [];
      i++;
    }
  }

  return result;
}

/**
 * Run the proxy CLI command against a config file.
 * @param {string[]} argv
 * @param {string} configPath
 * @param {object} io - { readConfig, writeConfig, log }
 */
export async function runProxyCli(argv, configPath, io = {}) {
  const { readConfig, writeConfig, log = console.log } = io;
  const parsed = parseCliArgs(argv);

  if (parsed.error) {
    log(`Error: ${parsed.error}`);
    return;
  }

  const config = await readConfig(configPath);

  if (parsed.command === 'show') {
    const proxy = config.proxy || {};
    if (!proxy.server) {
      log('No proxy configured.');
    } else {
      log(`Server:   ${proxy.server}`);
      if (proxy.port) log(`Port:     ${proxy.port}`);
      if (proxy.username) log(`Username: ${proxy.username}`);
      if (proxy.bypass) log(`Bypass:   ${proxy.bypass.join(', ')}`);
    }
    return;
  }

  if (parsed.command === 'clear') {
    delete config.proxy;
    await writeConfig(configPath, config);
    log('Proxy configuration cleared.');
    return;
  }

  if (parsed.command === 'set') {
    config.proxy = config.proxy || {};
    if (parsed.server !== undefined) config.proxy.server = parsed.server;
    if (parsed.port !== undefined) config.proxy.port = parsed.port;
    if (parsed.username !== undefined) config.proxy.username = parsed.username;
    if (parsed.password !== undefined) config.proxy.password = parsed.password;
    if (parsed.bypass !== undefined) config.proxy.bypass = parsed.bypass;
    await writeConfig(configPath, config);
    log('Proxy configuration updated.');
  }
}
