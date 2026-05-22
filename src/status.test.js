const { getUptime, buildStatus, formatStatusText } = require('./status');
const scheduler = require('./scheduler');
const jobmanager = require('./jobmanager');

jest.mock('./scheduler');
jest.mock('./jobmanager');
jest.mock('./reporter');

const mockConfig = {
  pages: [
    { url: 'https://example.com', schedule: '*/5 * * * *' },
    { url: 'https://other.com', schedule: '0 * * * *' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jobmanager.getActiveConfig.mockReturnValue(mockConfig);
  scheduler.getActiveJobIds.mockReturnValue(['https://example.com']);
});

describe('getUptime', () => {
  test('returns seconds for short uptime', () => {
    const start = Date.now() - 45_000;
    expect(getUptime(start)).toBe('45s');
  });

  test('returns minutes and seconds', () => {
    const start = Date.now() - 125_000;
    expect(getUptime(start)).toBe('2m 5s');
  });

  test('returns hours and minutes', () => {
    const start = Date.now() - 3_900_000;
    expect(getUptime(start)).toBe('1h 5m');
  });
});

describe('buildStatus', () => {
  test('reflects running state when config present', () => {
    const status = buildStatus(Date.now() - 10_000);
    expect(status.running).toBe(true);
    expect(status.pageCount).toBe(2);
    expect(status.activeJobs).toBe(1);
  });

  test('running is false when no config', () => {
    jobmanager.getActiveConfig.mockReturnValue(null);
    scheduler.getActiveJobIds.mockReturnValue([]);
    const status = buildStatus(null);
    expect(status.running).toBe(false);
    expect(status.uptime).toBeNull();
  });

  test('marks each page active correctly', () => {
    const status = buildStatus(Date.now());
    const ex = status.pages.find((p) => p.url === 'https://example.com');
    const ot = status.pages.find((p) => p.url === 'https://other.com');
    expect(ex.active).toBe(true);
    expect(ot.active).toBe(false);
  });
});

describe('formatStatusText', () => {
  test('contains key labels', () => {
    const status = buildStatus(Date.now() - 60_000);
    const text = formatStatusText(status);
    expect(text).toMatch('pagesnap status');
    expect(text).toMatch('running');
    expect(text).toMatch('https://example.com');
  });

  test('shows [on ] for active pages', () => {
    const status = buildStatus(Date.now());
    const text = formatStatusText(status);
    expect(text).toMatch('[on ]');
    expect(text).toMatch('[off]');
  });
});
