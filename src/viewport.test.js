const { mergeViewportConfig, validateViewport, describeViewport, DEFAULT_VIEWPORT } = require('./viewport');

describe('mergeViewportConfig', () => {
  it('returns defaults when no overrides given', () => {
    const v = mergeViewportConfig();
    expect(v).toEqual(DEFAULT_VIEWPORT);
  });

  it('applies global config over defaults', () => {
    const v = mergeViewportConfig({ width: 1920, height: 1080 });
    expect(v.width).toBe(1920);
    expect(v.height).toBe(1080);
    expect(v.isMobile).toBe(false);
  });

  it('page config overrides global config', () => {
    const v = mergeViewportConfig({ width: 1920 }, { width: 375, isMobile: true });
    expect(v.width).toBe(375);
    expect(v.isMobile).toBe(true);
  });

  it('does not mutate inputs', () => {
    const global = { width: 1024 };
    mergeViewportConfig(global, { width: 800 });
    expect(global.width).toBe(1024);
  });
});

describe('validateViewport', () => {
  it('returns no errors for valid viewport', () => {
    const errors = validateViewport(DEFAULT_VIEWPORT);
    expect(errors).toHaveLength(0);
  });

  it('errors on invalid width', () => {
    const errors = validateViewport({ ...DEFAULT_VIEWPORT, width: 0 });
    expect(errors.some(e => e.includes('width'))).toBe(true);
  });

  it('errors on invalid height', () => {
    const errors = validateViewport({ ...DEFAULT_VIEWPORT, height: 99999 });
    expect(errors.some(e => e.includes('height'))).toBe(true);
  });

  it('errors on invalid deviceScaleFactor', () => {
    const errors = validateViewport({ ...DEFAULT_VIEWPORT, deviceScaleFactor: 10 });
    expect(errors.some(e => e.includes('deviceScaleFactor'))).toBe(true);
  });

  it('errors on non-boolean isMobile', () => {
    const errors = validateViewport({ ...DEFAULT_VIEWPORT, isMobile: 'yes' });
    expect(errors.some(e => e.includes('isMobile'))).toBe(true);
  });

  it('errors on unknown keys', () => {
    const errors = validateViewport({ ...DEFAULT_VIEWPORT, zoom: 2 });
    expect(errors.some(e => e.includes('unknown'))).toBe(true);
  });
});

describe('describeViewport', () => {
  it('formats basic viewport', () => {
    expect(describeViewport({ width: 1280, height: 800 })).toBe('1280x800');
  });

  it('includes scale factor when not 1', () => {
    expect(describeViewport({ width: 1280, height: 800, deviceScaleFactor: 2 })).toBe('1280x800 @2x');
  });

  it('includes mobile label when isMobile is true', () => {
    expect(describeViewport({ width: 375, height: 667, isMobile: true })).toContain('(mobile)');
  });
});
