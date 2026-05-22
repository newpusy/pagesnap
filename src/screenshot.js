import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

/**
 * Launch a browser and take a screenshot of the given URL.
 * @param {string} url - The URL to screenshot.
 * @param {string} outputPath - Full path to save the PNG file.
 * @param {object} options - Optional puppeteer viewport/clip options.
 * @returns {Promise<string>} Resolved path of the saved screenshot.
 */
export async function takeScreenshot(url, outputPath, options = {}) {
  const { width = 1280, height = 800, fullPage = true } = options;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.screenshot({ path: outputPath, fullPage });
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Build a deterministic file path for a screenshot based on URL and timestamp.
 * @param {string} baseDir - Root directory for snapshots.
 * @param {string} url - The page URL.
 * @param {Date} [date] - Timestamp to embed in the filename.
 * @returns {string}
 */
export function buildScreenshotPath(baseDir, url, date = new Date()) {
  const slug = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const timestamp = date.toISOString().replace(/[:.]/g, '-');
  return path.join(baseDir, slug, `${timestamp}.png`);
}
