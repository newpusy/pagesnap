import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatNotification,
  sendWebhook,
  writeNotificationLog,
  notify,
} from './notify.js';

const sampleEntry = {
  url: 'https://example.com',
  timestamp: '2024-01-15T10:00:00.000Z',
  diffPercent: 3.14,
  diffImagePath: 'snapshots/diff/example-com.png',
};

describe('formatNotification', () => {
  it('includes url, timestamp, diffPercent in output', () => {
    const n = formatNotification(sampleEntry);
    expect(n.url).toBe(sampleEntry.url);
    expect(n.timestamp).toBe(sampleEntry.timestamp);
    expect(n.diffPercent).toBeCloseTo(3.14);
  });

  it('message contains url and percent', () => {
    const n = formatNotification(sampleEntry);
    expect(n.message).toContain('example.com');
    expect(n.message).toContain('3.14');
  });

  it('handles missing diffPercent gracefully', () => {
    const n = formatNotification({ url: 'https://a.com', timestamp: 'now' });
    expect(n.diffPercent).toBeNull();
    expect(n.message).not.toContain('%');
  });
});

describe('sendWebhook', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts JSON to the webhook url', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200 });
    const status = await sendWebhook('https://hooks.example.com/test', { message: 'hi' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://hooks.example.com/test',
      expect.objectContaining({ method: 'POST' })
    );
    expect(status).toBe(200);
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
    await expect(sendWebhook('https://hooks.example.com/test', {})).rejects.toThrow('500');
  });
});

describe('writeNotificationLog', () => {
  it('appends JSON line to log file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-notify-'));
    const logPath = path.join(tmpDir, 'notify.log');
    const n = formatNotification(sampleEntry);
    writeNotificationLog(logPath, n);
    const contents = fs.readFileSync(logPath, 'utf8');
    const parsed = JSON.parse(contents.trim());
    expect(parsed.url).toBe(sampleEntry.url);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('notify', () => {
  it('returns formatted notification object', async () => {
    const result = await notify(sampleEntry, { console: false });
    expect(result.title).toBe('pagesnap: visual change detected');
  });
});
