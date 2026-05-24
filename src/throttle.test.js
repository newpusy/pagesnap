const { mergeThrottleConfig, withDelay, withRetry } = require('./throttle');

describe('mergeThrottleConfig', () => {
  test('uses defaults when nothing provided', () => {
    const cfg = mergeThrottleConfig();
    expect(cfg.delayMs).toBe(0);
    expect(cfg.backoffMs).toBe(2000);
    expect(cfg.maxRetries).toBe(3);
  });

  test('local overrides global', () => {
    const cfg = mergeThrottleConfig({ delayMs: 100, maxRetries: 1 }, { delayMs: 500 });
    expect(cfg.delayMs).toBe(500);
    expect(cfg.maxRetries).toBe(1);
  });

  test('global fills missing local keys', () => {
    const cfg = mergeThrottleConfig({ backoffMs: 999 }, {});
    expect(cfg.backoffMs).toBe(999);
  });
});

describe('withDelay', () => {
  test('calls fn and returns result', async () => {
    const result = await withDelay(() => 42, 0);
    expect(result).toBe(42);
  });

  test('waits at least delayMs before calling fn', async () => {
    const start = Date.now();
    await withDelay(() => {}, 50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });
});

describe('withRetry', () => {
  test('returns value on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { backoffMs: 0, maxRetries: 3 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on failure and eventually succeeds', async () => {
    let calls = 0;
    const fn = jest.fn().mockImplementation(() => {
      calls++;
      if (calls < 3) throw new Error('fail');
      return Promise.resolve('done');
    });
    const result = await withRetry(fn, { backoffMs: 0, maxRetries: 3 });
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws after maxRetries exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, { backoffMs: 0, maxRetries: 2 })).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
