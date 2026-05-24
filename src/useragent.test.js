const {
  DEFAULT_USER_AGENT,
  PRESETS,
  mergeUserAgentConfig,
  resolveUserAgent,
  validateUserAgent,
  describeUserAgent,
} = require('./useragent');

describe('mergeUserAgentConfig', () => {
  test('returns null when neither global nor page defines userAgent', () => {
    expect(mergeUserAgentConfig({}, {})).toBeNull();
  });

  test('returns global value when page does not override', () => {
    expect(mergeUserAgentConfig({ userAgent: 'chrome' }, {})).toBe('chrome');
  });

  test('page value overrides global', () => {
    expect(mergeUserAgentConfig({ userAgent: 'chrome' }, { userAgent: 'firefox' })).toBe('firefox');
  });
});

describe('resolveUserAgent', () => {
  test('returns DEFAULT_USER_AGENT when given null', () => {
    expect(resolveUserAgent(null)).toBe(DEFAULT_USER_AGENT);
  });

  test('resolves known preset name case-insensitively', () => {
    expect(resolveUserAgent('Chrome')).toBe(PRESETS.chrome);
    expect(resolveUserAgent('MOBILE')).toBe(PRESETS.mobile);
  });

  test('returns raw string for unknown preset', () => {
    const custom = 'MyBot/2.0';
    expect(resolveUserAgent(custom)).toBe(custom);
  });

  test('resolves all built-in presets', () => {
    for (const key of Object.keys(PRESETS)) {
      expect(resolveUserAgent(key)).toBe(PRESETS[key]);
    }
  });
});

describe('validateUserAgent', () => {
  test('rejects non-string values', () => {
    expect(validateUserAgent(42).valid).toBe(false);
    expect(validateUserAgent(null).valid).toBe(false);
  });

  test('rejects empty string', () => {
    expect(validateUserAgent('   ').valid).toBe(false);
  });

  test('rejects strings over 512 chars', () => {
    expect(validateUserAgent('a'.repeat(513)).valid).toBe(false);
  });

  test('accepts valid user agent string', () => {
    expect(validateUserAgent('MyBot/1.0').valid).toBe(true);
  });
});

describe('describeUserAgent', () => {
  test('labels preset agents', () => {
    const desc = describeUserAgent('safari');
    expect(desc).toMatch(/^preset\(safari\):/);
  });

  test('labels custom agents', () => {
    const desc = describeUserAgent('MyCustomBot/3.0');
    expect(desc).toMatch(/^custom:/);
  });
});
