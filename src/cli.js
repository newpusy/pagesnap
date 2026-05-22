#!/usr/bin/env node
import { loadConfig, validateConfig, mergeConfig } from './config.js';
import { startJobs, stopJobs } from './jobmanager.js';
import { runCapture } from './runner.js';

const [,, command = 'start', ...args] = process.argv;

async function main() {
  const rawConfig = await loadConfig();
  const errors = validateConfig(rawConfig);

  if (errors.length > 0) {
    console.error('[pagesnap] Invalid config:');
    errors.forEach(e => console.error(' -', e));
    process.exit(1);
  }

  const config = mergeConfig(rawConfig);

  if (command === 'start') {
    console.log('[pagesnap] Starting scheduler...');
    startJobs(config);

    process.on('SIGINT', () => {
      console.log('\n[pagesnap] Shutting down...');
      stopJobs();
      process.exit(0);
    });

  } else if (command === 'run') {
    const targetUrl = args[0];
    const pages = targetUrl
      ? config.pages.filter(p => p.url === targetUrl)
      : config.pages;

    if (pages.length === 0) {
      console.error(`[pagesnap] No matching page for: ${targetUrl}`);
      process.exit(1);
    }

    console.log(`[pagesnap] Running ${pages.length} capture(s)...`);
    for (const page of pages) {
      const entry = await runCapture(page, config);
      console.log(`[pagesnap] ${entry.changed ? '⚠ changed' : '✓ ok'} — ${page.url}`);
    }

  } else {
    console.error(`[pagesnap] Unknown command: ${command}`);
    console.error('Usage: pagesnap [start|run] [url]');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[pagesnap] Fatal error:', err.message);
  process.exit(1);
});
