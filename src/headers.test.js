const { mergeHeaders, validateHeaders, applyHeaders, describeHeaders } = require('./headers');

describe('mergeHeaders', () => {
  test('returns empty object when no args', () => {
    expect(mergeHeaders()).toEqual({});
  });

  test('merges global and page headers', () => {
    const global = { 'X-Token': 'abc', 'Accept-Language': 'en' };
    const page = { 'X-Token': 'override', 'X-Custom': 'yes' };
    expect(mergeHeaders(global, page)).toEqual({
      'X-Token': 'override',
      'Accept-Language': 'en',
      'X-Custom': 'yes',
    });
  });

  test('page headers take precedence', () => {
    expect(mergeHeaders({ 'X-A': '1' }, { 'X-A': '2' })).toEqual({ 'X-A': '2' });
  });
});

describe('validateHeaders', () => {
  test('valid headers pass', () => {
    const { valid, errors } = validateHeaders({ Authorization: 'Bearer tok', 'X-Foo': 'bar' });
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('non-string value fails', () => {
    const { valid, errors } = validateHeaders({ 'X-Count': 42 });
    expect(valid).toBe(false);
    expect(errors[0]).toMatch('X-Count');
  });

  test('empty object is valid', () => {
    expect(validateHeaders({}).valid).toBe(true);
  });
});

describe('applyHeaders', () => {
  test('calls setExtraHTTPHeaders with headers', async () => {
    const page = { setExtraHTTPHeaders: jest.fn().mockResolvedValue(undefined) };
    await applyHeaders(page, { Authorization: 'Bearer x' });
    expect(page.setExtraHTTPHeaders).toHaveBeenCalledWith({ Authorization: 'Bearer x' });
  });

  test('skips call when no headers', async () => {
    const page = { setExtraHTTPHeaders: jest.fn() };
    await applyHeaders(page, {});
    expect(page.setExtraHTTPHeaders).not.toHaveBeenCalled();
  });
});

describe('describeHeaders', () => {
  test('describes multiple headers', () => {
    const result = describeHeaders({ 'X-A': '1', 'X-B': '2' });
    expect(result).toMatch('2 header(s)');
    expect(result).toMatch('X-A');
  });

  test('returns fallback for empty headers', () => {
    expect(describeHeaders({})).toBe('no custom headers');
  });
});
