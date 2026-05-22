import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runCapture } from './runner.js';

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue(null),
          screenshot: vi.fn().mockResolvedValue(null),
        }),
      }),
      close: vi.fn().mockResolvedValue(null),
    }),
  },
}));

vi.mock('./snapstore.js', () => ({
  saveSnap: vi.fn().mockResolvedValue(null),
  getLatestSnap: vi.fn().mockResolvedValue(null),
}));

vi.mock('./diff.js', () => ({
  diffScreenshots: vi.fn().mockResolvedValue({ mismatched: 0, total: 100, percent: 0 }),
  hasVisualChange: vi.fn().mockReturnValue(false),
}));

vi.mock('./reporter.js', () => ({
  appendReportEntry: vi.fn().mockResolvedValue(null),
}));

vi.mock('./notify.js', () => ({
  writeNotificationLog: vi.fn().mockResolvedValue(null),
}));

const pageConfig = { url: 'https://example.com', label: 'Example', schedule: '0 * * * *' };
const globalConfig = { outputDir: '/tmp/snaps', diffThreshold: 0.01 };

describe('runCapture', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an entry with expected fields', async () => {
    const entry = await runCapture(pageConfig, globalConfig);
    expect(entry).toMatchObject({
      url: 'https://example.com',
      label: 'Example',
      changed: false,
    });
    expect(entry.screenshotPath).toContain('example-com');
  });

  it('does not call writeNotificationLog when no change', async () => {
    const { writeNotificationLog } = await import('./notify.js');
    await runCapture(pageConfig, globalConfig);
    expect(writeNotificationLog).not.toHaveBeenCalled();
  });

  it('calls writeNotificationLog when change detected', async () => {
    const { hasVisualChange } = await import('./diff.js');
    const { writeNotificationLog } = await import('./notify.js');
    const { getLatestSnap } = await import('./snapstore.js');
    getLatestSnap.mockResolvedValueOnce('/tmp/snaps/prev.png');
    hasVisualChange.mockReturnValueOnce(true);
    await runCapture(pageConfig, globalConfig);
    expect(writeNotificationLog).toHaveBeenCalledOnce();
  });
});
