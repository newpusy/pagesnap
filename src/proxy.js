// proxy.js — HTTP proxy support for screenshot capture

const DEFAULT_PROXY_CONFIG = {
  enabled: false,
  url: null,
  bypass: [],
  rejectUnauthorized: true,
};

function mergeProxyConfig(globalConfig, pageConfig = {}) {
  const base = globalConfig.proxy || {};
  const override = pageConfig.proxy || {};
  return Object.assign({}, DEFAULT_PROXY_CONFIG, base, override);
}

function buildProxyArgs(proxyConfig) {
  if (!proxyConfig.enabled || !proxyConfig.url) return [];

  const args = [`--proxy-server=${proxyConfig.url}`];

  if (proxyConfig.bypass && proxyConfig.bypass.length > 0) {
    args.push(`--proxy-bypass-list=${proxyConfig.bypass.join(',')}`);
  }

  return args;
}

function buildLaunchOptions(proxyConfig) {
  if (!proxyConfig.enabled || !proxyConfig.url) return {};

  return {
    args: buildProxyArgs(proxyConfig),
    ignoreHTTPSErrors: !proxyConfig.rejectUnauthorized,
  };
}

function isProxyEnabled(proxyConfig) {
  return Boolean(proxyConfig && proxyConfig.enabled && proxyConfig.url);
}

module.exports = {
  mergeProxyConfig,
  buildProxyArgs,
  buildLaunchOptions,
  isProxyEnabled,
};
