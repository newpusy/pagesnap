const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  outputDir: './snapshots',
  schedule: '0 * * * *',
  pages: [],
  diffThreshold: 0.1,
  viewport: {
    width: 1280,
    height: 800
  }
};

function loadConfig(configPath) {
  const resolvedPath = path.resolve(configPath || 'pagesnap.config.json');

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  let userConfig;
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    userConfig = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse config file: ${err.message}`);
  }

  validateConfig(userConfig);

  return mergeConfig(DEFAULT_CONFIG, userConfig);
}

function validateConfig(config) {
  if (!config.pages || !Array.isArray(config.pages) || config.pages.length === 0) {
    throw new Error('Config must include a non-empty "pages" array');
  }

  for (const page of config.pages) {
    if (!page.url) {
      throw new Error('Each page entry must have a "url" field');
    }
    try {
      new URL(page.url);
    } catch {
      throw new Error(`Invalid URL in pages config: "${page.url}"`);
    }
  }
}

function mergeConfig(defaults, overrides) {
  return {
    ...defaults,
    ...overrides,
    viewport: {
      ...defaults.viewport,
      ...(overrides.viewport || {})
    }
  };
}

module.exports = { loadConfig, validateConfig, mergeConfig, DEFAULT_CONFIG };
