import { chromium } from 'playwright';
import { buildScreenshotPath } from './screenshot.js';
import { urlToSlug } from './capture.js';
import { diffScreenshots, hasVisualChange } from './diff.js';
import { appendReportEntry } from './reporter.js';
import { writeNotificationLog } from './notify.js';
import { saveSnap, getLatestSnap } from './snapstore.js';
import path from 'path';

/**
 * Run a single capture job for a given page config entry.
 * @param {object} pageConfig - { url, label, schedule, viewport }
 * @param {object} globalConfig - full loaded config
 */
export async function runCapture(pageConfig, globalConfig) {
  const { url, label, viewport = {} } = pageConfig;
  const { outputDir = 'snaps', diffThreshold = 0.01 } = globalConfig;

  const slug = urlToSlug(url);
  const timestamp = new Date().toISOString();
  const screenshotPath = buildScreenshotPath(outputDir, slug, timestamp);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: {
      width: viewport.width || 1280,
      height: viewport.height || 800,
    },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } finally {
    await browser.close();
  }

  const previous = await getLatestSnap(slug, outputDir);
  let changed = false;
  let diffResult = null;

  if (previous) {
    diffResult = await diffScreenshots(previous, screenshotPath);
    changed = hasVisualChange(diffResult, diffThreshold);
  }

  await saveSnap(slug, screenshotPath, outputDir);

  const entry = { url, label, slug, timestamp, screenshotPath, changed, diffResult };
  await appendReportEntry(entry, globalConfig);

  if (changed) {
    await writeNotificationLog(entry, globalConfig);
  }

  return entry;
}
