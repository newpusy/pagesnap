import { scheduleJob, cancelAllJobs } from './scheduler.js';
import { runCapture } from './runner.js';

let activeConfig = null;

/**
 * Start all scheduled jobs defined in config.
 * @param {object} config - full loaded config
 */
export function startJobs(config) {
  cancelAllJobs();
  activeConfig = config;

  for (const page of config.pages) {
    if (!page.schedule) {
      console.warn(`[pagesnap] No schedule for ${page.url}, skipping.`);
      continue;
    }

    scheduleJob(page.url, page.schedule, async () => {
      try {
        const entry = await runCapture(page, config);
        const status = entry.changed ? '⚠ changed' : '✓ ok';
        console.log(`[pagesnap] ${status} — ${page.url} @ ${entry.timestamp}`);
      } catch (err) {
        console.error(`[pagesnap] Error capturing ${page.url}:`, err.message);
      }
    });

    console.log(`[pagesnap] Scheduled ${page.url} → ${page.schedule}`);
  }
}

/**
 * Stop all running jobs.
 */
export function stopJobs() {
  cancelAllJobs();
  activeConfig = null;
  console.log('[pagesnap] All jobs stopped.');
}

/**
 * Return the currently active config.
 */
export function getActiveConfig() {
  return activeConfig;
}
