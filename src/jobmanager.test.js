import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startJobs, stopJobs, getActiveConfig } from './jobmanager.js';

vi.mock('./scheduler.js', () => ({
  scheduleJob: vi.fn(),
  cancelAllJobs: vi.fn(),
}));

vi.mock('./runner.js', () => ({
  runCapture: vi.fn().mockResolvedValue({ changed: false, url: 'https://example.com', timestamp: 'ts' }),
}));

const mockConfig = {
  outputDir: '/tmp/snaps',
  diffThreshold: 0.01,
  pages: [
    { url: 'https://example.com', label: 'Example', schedule: '0 * * * *' },
    { url: 'https://no-schedule.com', label: 'NoSchedule' },
  ],
};

describe('jobmanager', () => {
  beforeEach(() => vi.clearAllMocks());

  it('schedules jobs for pages with a schedule', async () => {
    const { scheduleJob } = await import('./scheduler.js');
    startJobs(mockConfig);
    expect(scheduleJob).toHaveBeenCalledOnce();
    expect(scheduleJob).toHaveBeenCalledWith(
      'https://example.com',
      '0 * * * *',
      expect.any(Function)
    );
  });

  it('cancels all jobs before starting new ones', async () => {
    const { cancelAllJobs } = await import('./scheduler.js');
    startJobs(mockConfig);
    expect(cancelAllJobs).toHaveBeenCalledOnce();
  });

  it('stores active config', () => {
    startJobs(mockConfig);
    expect(getActiveConfig()).toBe(mockConfig);
  });

  it('clears active config on stopJobs', () => {
    startJobs(mockConfig);
    stopJobs();
    expect(getActiveConfig()).toBeNull();
  });

  it('cancels all jobs on stopJobs', async () => {
    const { cancelAllJobs } = await import('./scheduler.js');
    stopJobs();
    expect(cancelAllJobs).toHaveBeenCalled();
  });
});
