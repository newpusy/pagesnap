import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { buildScreenshotPath, takeScreenshot } from './screenshot.js';

// Mock puppeteer so tests don't launch a real browser
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setViewport: vi.fn(),
        goto: vi.fn(),
        screenshot: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
}));

// Mock fs so we don't touch the real filesystem
vi.mock('fs/promises', () => ({
  default: { mkdir: vi.fn().mockResolvedValue(undefined) },
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

describe('buildScreenshotPath', () => {
  const base = '/snapshots';
  const fixedDate = new Date('2024-06-01T12:00:00.000Z');

  it('produces a path inside baseDir', () => {
    const result = buildScreenshotPath(base, 'https://example.com', fixedDate);
    expect(result.startsWith(base)).toBe(true);
  });

  it('slugifies the URL correctly', () => {
    const result = buildScreenshotPath(base, 'https://example.com/path?q=1', fixedDate);
    expect(result).toContain('example_com_path_q_1');
  });

  it('ends with .png', () => {
    const result = buildScreenshotPath(base, 'https://example.com', fixedDate);
    expect(result.endsWith('.png')).toBe(true);
  });

  it('embeds the timestamp in the filename', () => {
    const result = buildScreenshotPath(base, 'https://example.com', fixedDate);
    expect(path.basename(result)).toContain('2024-06-01T12-00-00-000Z');
  });
});

describe('takeScreenshot', () => {
  it('returns the output path on success', async () => {
    const out = '/snapshots/example/shot.png';
    const result = await takeScreenshot('https://example.com', out);
    expect(result).toBe(out);
  });
});
