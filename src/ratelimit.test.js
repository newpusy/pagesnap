const {
  mergeRateLimitConfig,
  isRateLimited,
  recordRun,
  isConcurrencyLimited,
  acquireSlot,
  releaseSlot,
  getActiveCount,
  resetState,
} = require('./ratelimit');

beforeEach(() => resetState());

describe('mergeRateLimitConfig', () => {
  it('uses defaults when nothing provided', () => {
    const cfg = mergeRateLimitConfig();
    expect(cfg.minIntervalMs).toBe(5000);
    expect(cfg.maxConcurrent).toBe(2);
  });

  it('per-url overrides global', () => {
    const cfg = mergeRateLimitConfig(
      { minIntervalMs: 3000, maxConcurrent: 4 },
      { minIntervalMs: 1000 }
    );
    expect(cfg.minIntervalMs).toBe(1000);
    expect(cfg.maxConcurrent).toBe(4);
  });

  it('global fills in missing per-url values', () => {
    const cfg = mergeRateLimitConfig({ minIntervalMs: 8000 }, {});
    expect(cfg.minIntervalMs).toBe(8000);
  });
});

describe('isRateLimited / recordRun', () => {
  it('not limited before first run', () => {
    expect(isRateLimited('example-com', 5000)).toBe(false);
  });

  it('limited immediately after recording', () => {
    recordRun('example-com');
    expect(isRateLimited('example-com', 5000)).toBe(true);
  });

  it('not limited after interval passes', () => {
    recordRun('example-com');
    expect(isRateLimited('example-com', 0)).toBe(false);
  });
});

describe('concurrency tracking', () => {
  it('starts at zero', () => {
    expect(getActiveCount()).toBe(0);
  });

  it('acquireSlot increments count', () => {
    acquireSlot();
    expect(getActiveCount()).toBe(1);
  });

  it('releaseSlot decrements count', () => {
    acquireSlot();
    acquireSlot();
    releaseSlot();
    expect(getActiveCount()).toBe(1);
  });

  it('isConcurrencyLimited when at max', () => {
    acquireSlot();
    acquireSlot();
    expect(isConcurrencyLimited(2)).toBe(true);
    expect(isConcurrencyLimited(3)).toBe(false);
  });

  it('releaseSlot does not go below zero', () => {
    releaseSlot();
    expect(getActiveCount()).toBe(0);
  });
});
