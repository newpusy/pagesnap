import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseCliArgs } from './proxycli.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

function makeTempConfig(data) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proxycli-'));
  const file = path.join(dir, 'pagesnap.config.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return { dir, file };
}

describe('parseCliArgs', () => {
  it('returns proxy status for show command', () => {
    const result = parseCliArgs(['show']);
    expect(result.command).toBe('show');
  });

  it('returns set command with server and port', () => {
    const result = parseCliArgs(['set', '--server', 'http://proxy.local', '--port', '8080']);
    expect(result.command).toBe('set');
    expect(result.server).toBe('http://proxy.local');
    expect(result.port).toBe(8080);
  });

  it('returns clear command', () => {
    const result = parseCliArgs(['clear']);
    expect(result.command).toBe('clear');
  });

  it('defaults command to show when none given', () => {
    const result = parseCliArgs([]);
    expect(result.command).toBe('show');
  });

  it('parses bypass list', () => {
    const result = parseCliArgs(['set', '--server', 'http://proxy.local', '--bypass', 'localhost,127.0.0.1']);
    expect(result.bypass).toEqual(['localhost', '127.0.0.1']);
  });

  it('parses auth username and password', () => {
    const result = parseCliArgs(['set', '--server', 'http://proxy.local', '--username', 'user', '--password', 'pass']);
    expect(result.username).toBe('user');
    expect(result.password).toBe('pass');
  });

  it('returns unknown command error for unrecognised command', () => {
    const result = parseCliArgs(['bogus']);
    expect(result.error).toMatch(/unknown command/i);
  });
});
