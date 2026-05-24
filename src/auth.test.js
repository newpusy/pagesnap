const { mergeAuthConfig, validateAuth, buildAuthHeaders, describeAuth } = require('./auth');

describe('mergeAuthConfig', () => {
  test('returns defaults when no auth provided', () => {
    const result = mergeAuthConfig({}, {});
    expect(result.type).toBeNull();
  });

  test('page auth overrides global auth', () => {
    const global = { auth: { type: 'bearer', token: 'global-token' } };
    const page = { auth: { type: 'bearer', token: 'page-token' } };
    const result = mergeAuthConfig(global, page);
    expect(result.token).toBe('page-token');
  });

  test('falls back to global auth when page has none', () => {
    const global = { auth: { type: 'bearer', token: 'global-token' } };
    const result = mergeAuthConfig(global, {});
    expect(result.token).toBe('global-token');
  });
});

describe('validateAuth', () => {
  test('returns null when no type set', () => {
    expect(validateAuth({ type: null })).toBeNull();
  });

  test('throws if basic auth missing username', () => {
    expect(() => validateAuth({ type: 'basic', password: 'x' })).toThrow('username');
  });

  test('throws if bearer auth missing token', () => {
    expect(() => validateAuth({ type: 'bearer' })).toThrow('token');
  });

  test('returns valid basic auth config', () => {
    const auth = { type: 'basic', username: 'admin', password: 'secret' };
    expect(validateAuth(auth)).toEqual(auth);
  });

  test('throws on unknown auth type', () => {
    expect(() => validateAuth({ type: 'digest' })).toThrow('Unknown auth.type');
  });
});

describe('buildAuthHeaders', () => {
  test('returns empty object when no auth', () => {
    expect(buildAuthHeaders(null)).toEqual({});
    expect(buildAuthHeaders({ type: null })).toEqual({});
  });

  test('builds correct Basic header', () => {
    const auth = { type: 'basic', username: 'user', password: 'pass' };
    const headers = buildAuthHeaders(auth);
    const expected = 'Basic ' + Buffer.from('user:pass').toString('base64');
    expect(headers.Authorization).toBe(expected);
  });

  test('builds correct Bearer header', () => {
    const auth = { type: 'bearer', token: 'abc123' };
    const headers = buildAuthHeaders(auth);
    expect(headers.Authorization).toBe('Bearer abc123');
  });
});

describe('describeAuth', () => {
  test('returns none for missing auth', () => {
    expect(describeAuth(null)).toBe('none');
  });

  test('describes basic auth with username', () => {
    expect(describeAuth({ type: 'basic', username: 'admin' })).toContain('admin');
  });

  test('describes bearer token', () => {
    expect(describeAuth({ type: 'bearer', token: 't' })).toBe('bearer token');
  });
});
