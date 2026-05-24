#!/usr/bin/env node
'use strict';

const { loadConfig } = require('./config');
const { buildScreenshotPath } = require('./screenshot');
const { listBaselines } = require('./baseline');
const { readReportEntries, summariseReport } = require('./reporter');
const { urlToSlug } = require('./capture');

function parseCliArgs(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  return { command, args: rest };
}

async function runPageCli(argv, configPath = 'pagesnap.config.json') {
  const { command, args } = parseCliArgs(argv);
  const config = await loadConfig(configPath);
  const pages = config.pages || [];

  if (command === 'list') {
    if (pages.length === 0) {
      console.log('No pages configured.');
      return;
    }
    pages.forEach((p, i) => {
      const slug = urlToSlug(p.url);
      console.log(`[${i + 1}] ${p.url}  (slug: ${slug}, schedule: ${p.schedule || config.schedule || 'none'})`);
    });
    return;
  }

  if (command === 'info') {
    const [urlOrSlug] = args;
    if (!urlOrSlug) {
      console.error('Usage: pagecli info <url|slug>');
      process.exit(1);
    }
    const page = pages.find(p => p.url === urlOrSlug || urlToSlug(p.url) === urlOrSlug);
    if (!page) {
      console.error(`Page not found: ${urlOrSlug}`);
      process.exit(1);
    }
    const slug = urlToSlug(page.url);
    const baselines = await listBaselines(config.baselineDir || 'baselines');
    const hasBaseline = baselines.includes(slug);
    const entries = await readReportEntries(config.reportPath || 'report.ndjson');
    const pageEntries = entries.filter(e => e.slug === slug);
    const summary = summariseReport(pageEntries);
    console.log(`URL:       ${page.url}`);
    console.log(`Slug:      ${slug}`);
    console.log(`Schedule:  ${page.schedule || config.schedule || 'none'}`);
    console.log(`Baseline:  ${hasBaseline ? 'set' : 'not set'}`);
    console.log(`Runs:      ${summary.total}`);
    console.log(`Changes:   ${summary.changed}`);
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error('Available commands: list, info');
  process.exit(1);
}

module.exports = { parseCliArgs, runPageCli };

if (require.main === module) {
  runPageCli(process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
