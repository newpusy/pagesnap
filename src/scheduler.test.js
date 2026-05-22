const { scheduleJob, cancelJob, cancelAllJobs, getActiveJobIds, isValidCronExpression } = require('./scheduler');

afterEach(() => {
  cancelAllJobs();
});

describe('isValidCronExpression', () => {
  test('accepts valid cron expressions', () => {
    expect(isValidCronExpression('* * * * *')).toBe(true);
    expect(isValidCronExpression('0 9 * * 1-5')).toBe(true);
    expect(isValidCronExpression('*/15 * * * *')).toBe(true);
  });

  test('rejects invalid cron expressions', () => {
    expect(isValidCronExpression('not-a-cron')).toBe(false);
    expect(isValidCronExpression('')).toBe(false);
    expect(isValidCronExpression('99 99 99 99 99')).toBe(false);
  });
});

describe('scheduleJob', () => {
  test('schedules a job and returns its id', () => {
    const page = { name: 'homepage', url: 'https://example.com', schedule: '* * * * *' };
    const jobId = scheduleJob(page, jest.fn());
    expect(jobId).toBe('homepage');
    expect(getActiveJobIds()).toContain('homepage');
  });

  test('uses url as job id when name is not provided', () => {
    const page = { url: 'https://example.com/about', schedule: '*/5 * * * *' };
    const jobId = scheduleJob(page, jest.fn());
    expect(jobId).toBe('https://example.com/about');
  });

  test('throws on invalid cron expression', () => {
    const page = { name: 'bad-page', url: 'https://example.com', schedule: 'bad-cron' };
    expect(() => scheduleJob(page, jest.fn())).toThrow('Invalid cron expression');
  });

  test('skips duplicate job ids', () => {
    const page = { name: 'dup', url: 'https://example.com', schedule: '* * * * *' };
    scheduleJob(page, jest.fn());
    scheduleJob(page, jest.fn());
    expect(getActiveJobIds().filter(id => id === 'dup').length).toBe(1);
  });
});

describe('cancelJob', () => {
  test('cancels an existing job', () => {
    const page = { name: 'to-cancel', url: 'https://example.com', schedule: '* * * * *' };
    scheduleJob(page, jest.fn());
    const result = cancelJob('to-cancel');
    expect(result).toBe(true);
    expect(getActiveJobIds()).not.toContain('to-cancel');
  });

  test('returns false for unknown job id', () => {
    const result = cancelJob('nonexistent');
    expect(result).toBe(false);
  });
});

describe('cancelAllJobs', () => {
  test('stops and removes all active jobs', () => {
    scheduleJob({ name: 'a', url: 'https://a.com', schedule: '* * * * *' }, jest.fn());
    scheduleJob({ name: 'b', url: 'https://b.com', schedule: '* * * * *' }, jest.fn());
    cancelAllJobs();
    expect(getActiveJobIds()).toHaveLength(0);
  });
});
