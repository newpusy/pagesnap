const fs = require('fs');
const os = require('os');
const path = require('path');
const { mergeCookies, validateCookie, validateCookies, injectCookies, loadCookiesFromFile } = require('./cookies');

function writeTempCookies(cookies) {
  const p = path.join(os.tmpdir(), `cookies-${Date.now()}.json`);
  fs.writeFileSync(p, JSON.stringify(cookies));
  return p;
}

describe('mergeCookies', () => {
  test('returns global cookies when no page cookies', () => {
    const result = mergeCookies([{ name: 'session', value: 'abc' }], []);
    expect(result).toEqual([{ name: 'session', value: 'abc' }]);
  });

  test('page cookies override global by name', () => {
    const global = [{ name: 'session', value: 'old' }];
    const page = [{ name: 'session', value: 'new' }];
    const result = mergeCookies(global, page);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('new');
  });

  test('merges distinct cookies', () => {
    const result = mergeCookies([{ name: 'a', value: '1' }], [{ name: 'b', value: '2' }]);
    expect(result).toHaveLength(2);
  });

  test('handles empty inputs', () => {
    expect(mergeCookies()).toEqual([]);
  });
});

describe('validateCookie', () => {
  test('valid cookie passes', () => {
    expect(validateCookie({ name: 'tok', value: 'xyz' })).toBe(true);
  });

  test('missing name fails', () => {
    expect(validateCookie({ value: 'x' })).toBe(false);
  });

  test('missing value fails', () => {
    expect(validateCookie({ name: 'tok' })).toBe(false);
  });

  test('non-object fails', () => {
    expect(validateCookie('bad')).toBe(false);
  });
});

describe('validateCookies', () => {
  test('returns no errors for valid array', () => {
    expect(validateCookies([{ name: 'a', value: '1' }])).toEqual([]);
  });

  test('returns error for non-array', () => {
    expect(validateCookies('bad')).toContain('cookies must be an array');
  });

  test('reports index of bad cookie', () => {
    const errs = validateCookies([{ name: 'ok', value: 'v' }, { value: 'no-name' }]);
    expect(errs[0]).toMatch(/cookie\[1\]/);
  });
});

describe('injectCookies', () => {
  test('calls setCookie for each cookie', async () => {
    const setCookie = jest.fn().mockResolvedValue();
    const page = { setCookie };
    await injectCookies(page, [{ name: 'a', value: '1' }, { name: 'b', value: '2' }]);
    expect(setCookie).toHaveBeenCalledTimes(2);
  });

  test('does nothing with empty cookies', async () => {
    const setCookie = jest.fn();
    await injectCookies({ setCookie }, []);
    expect(setCookie).not.toHaveBeenCalled();
  });
});

describe('loadCookiesFromFile', () => {
  test('loads valid cookie file', () => {
    const p = writeTempCookies([{ name: 'x', value: 'y' }]);
    const result = loadCookiesFromFile(p);
    expect(result).toEqual([{ name: 'x', value: 'y' }]);
    fs.unlinkSync(p);
  });

  test('throws if file contains non-array', () => {
    const p = writeTempCookies({ name: 'x' });
    expect(() => loadCookiesFromFile(p)).toThrow('JSON array');
    fs.unlinkSync(p);
  });
});
