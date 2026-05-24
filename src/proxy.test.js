const { mergeProxyConfig, buildProxyArgs, buildLaunchOptions, isProxyEnabled } = require('./proxy');

describe('mergeProxyConfig', () => {
  it('returns defaults when no config provided', () => {
    const result = mergeProxyConfig({});
    expect(result.enabled).toBe(false);
    expect(result.url).toBeNull();
    expect(result.bypass).toEqual([]);
    expect(result.rejectUnauthorized).toBe(true);
  });

  it('merges global proxy config', () => {
    const result = mergeProxyConfig({ proxy: { enabled: true, url: 'http://proxy:8080' } });
    expect(result.enabled).toBe(true);
    expect(result.url).toBe('http://proxy:8080');
  });

  it('page config overrides global config', () => {
    const global = { proxy: { enabled: true, url: 'http://global:8080' } };
    const page = { proxy: { url: 'http://page:9090' } };
    const result = mergeProxyConfig(global, page);
    expect(result.url).toBe('http://page:9090');
  });
});

describe('buildProxyArgs', () => {
  it('returns empty array when proxy disabled', () => {
    expect(buildProxyArgs({ enabled: false, url: null })).toEqual([]);
  });

  it('returns proxy server arg when enabled', () => {
    const args = buildProxyArgs({ enabled: true, url: 'http://proxy:8080', bypass: [] });
    expect(args).toContain('--proxy-server=http://proxy:8080');
  });

  it('includes bypass list when provided', () => {
    const args = buildProxyArgs({ enabled: true, url: 'http://proxy:8080', bypass: ['localhost', '127.0.0.1'] });
    expect(args).toContain('--proxy-bypass-list=localhost,127.0.0.1');
  });
});

describe('buildLaunchOptions', () => {
  it('returns empty object when proxy disabled', () => {
    expect(buildLaunchOptions({ enabled: false })).toEqual({});
  });

  it('includes ignoreHTTPSErrors when rejectUnauthorized is false', () => {
    const opts = buildLaunchOptions({ enabled: true, url: 'http://proxy:8080', bypass: [], rejectUnauthorized: false });
    expect(opts.ignoreHTTPSErrors).toBe(true);
  });
});

describe('isProxyEnabled', () => {
  it('returns false when disabled', () => {
    expect(isProxyEnabled({ enabled: false, url: null })).toBe(false);
  });

  it('returns true when enabled with url', () => {
    expect(isProxyEnabled({ enabled: true, url: 'http://proxy:8080' })).toBe(true);
  });

  it('returns false when enabled but no url', () => {
    expect(isProxyEnabled({ enabled: true, url: null })).toBe(false);
  });
});
