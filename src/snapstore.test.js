import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSnapshots, getLatestPair, pruneSnapshots } from './snapstore.js';

const mockFiles = ['2024-01.png', '2024-02.png', '2024-03.png'];

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    unlink: vi.fn().mockResolvedValue(undefined),
  },
  readdir: vi.fn(),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

import fs from 'fs/promises';

beforeEach(() => {
  vi.clearAllMocks();
  fs.readdir.mockResolvedValue(mockFiles);
});

describe('listSnapshots', () => {
  it('returns sorted png paths', async () => {
    const result = await listSnapshots('/snaps', 'example_com');
    expect(result).toHaveLength(3);
    expect(result[0]).toContain('2024-01.png');
  });

  it('returns empty array if directory missing', async () => {
    fs.readdir.mockRejectedValueOnce(new Error('ENOENT'));
    const result = await listSnapshots('/snaps', 'missing');
    expect(result).toEqual([]);
  });
});

describe('getLatestPair', () => {
  it('returns previous and current', async () => {
    const pair = await getLatestPair('/snaps', 'example_com');
    expect(pair).not.toBeNull();
    expect(pair.current).toContain('2024-03.png');
    expect(pair.previous).toContain('2024-02.png');
  });

  it('returns null if fewer than 2 snapshots', async () => {
    fs.readdir.mockResolvedValueOnce(['2024-01.png']);
    const pair = await getLatestPair('/snaps', 'example_com');
    expect(pair).toBeNull();
  });
});

describe('pruneSnapshots', () => {
  it('deletes old files beyond keep limit', async () => {
    const deleted = await pruneSnapshots('/snaps', 'example_com', 2);
    expect(deleted).toHaveLength(1);
    expect(fs.unlink).toHaveBeenCalledTimes(1);
  });

  it('does nothing if within keep limit', async () => {
    const deleted = await pruneSnapshots('/snaps', 'example_com', 10);
    expect(deleted).toHaveLength(0);
    expect(fs.unlink).not.toHaveBeenCalled();
  });
});
