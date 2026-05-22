import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  formatTimestamp,
  buildReportEntry,
  appendReportEntry,
  readReportEntries,
  summariseReport,
} from './reporter.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-reporter-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('formatTimestamp', () => {
  it('returns a formatted UTC string without T separator', () => {
    const d = new Date('2024-06-15T10:30:00.000Z');
    expect(formatTimestamp(d)).toBe('2024-06-15 10:30:00');
  });

  it('defaults to current time without throwing', () => {
    const result = formatTimestamp();
    expect(typeof result).toBe('string');
    expect(result).toHaveLength(19);
  });
});

describe('buildReportEntry', () => {
  it('builds a valid entry with all fields', () => {
    const entry = buildReportEntry({
      url: 'https://example.com',
      slug: 'example-com',
      timestamp: new Date('2024-01-01T00:00:00Z'),
      hasChange: true,
      snapshotPath: '/snaps/example-com.png',
      diffPath: '/snaps/example-com.diff.png',
    });
    expect(entry.url).toBe('https://example.com');
    expect(entry.hasChange).toBe(true);
    expect(entry.diffPath).toBe('/snaps/example-com.diff.png');
    expect(entry.timestamp).toBe('2024-01-01 00:00:00');
  });

  it('defaults diffPath to null when not provided', () => {
    const entry = buildReportEntry({
      url: 'https://example.com',
      slug: 'example-com',
      timestamp: new Date(),
      hasChange: false,
      snapshotPath: '/snaps/example-com.png',
    });
    expect(entry.diffPath).toBeNull();
  });
});

describe('appendReportEntry / readReportEntries', () => {
  it('round-trips entries through the report file', () => {
    const reportFile = path.join(tmpDir, 'reports', 'report.jsonl');
    const entry1 = buildReportEntry({ url: 'https://a.com', slug: 'a-com', timestamp: new Date(), hasChange: false, snapshotPath: '/a.png' });
    const entry2 = buildReportEntry({ url: 'https://b.com', slug: 'b-com', timestamp: new Date(), hasChange: true, snapshotPath: '/b.png', diffPath: '/b.diff.png' });

    appendReportEntry(reportFile, entry1);
    appendReportEntry(reportFile, entry2);

    const entries = readReportEntries(reportFile);
    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe('a-com');
    expect(entries[1].hasChange).toBe(true);
  });

  it('returns empty array when file does not exist', () => {
    const result = readReportEntries(path.join(tmpDir, 'nonexistent.jsonl'));
    expect(result).toEqual([]);
  });
});

describe('summariseReport', () => {
  it('correctly counts changed and unchanged entries', () => {
    const entries = [
      { hasChange: true },
      { hasChange: false },
      { hasChange: true },
    ];
    const summary = summariseReport(entries);
    expect(summary.total).toBe(3);
    expect(summary.changed).toBe(2);
    expect(summary.unchanged).toBe(1);
  });

  it('handles empty entries', () => {
    expect(summariseReport([])).toEqual({ total: 0, changed: 0, unchanged: 0 });
  });
});
