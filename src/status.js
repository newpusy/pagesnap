// status.js — summarise current pagesnap runtime state

const { getActiveJobIds } = require('./scheduler');
const { getActiveConfig } = require('./jobmanager');
const { readReportEntries } = require('./reporter');

function getUptime(startTime) {
  const ms = Date.now() - startTime;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function buildStatus(startTime) {
  const config = getActiveConfig();
  const activeJobs = getActiveJobIds();
  const pages = config ? config.pages || [] : [];

  return {
    running: config !== null,
    uptime: startTime ? getUptime(startTime) : null,
    activeJobs: activeJobs.length,
    pageCount: pages.length,
    pages: pages.map((p) => ({
      url: p.url,
      schedule: p.schedule,
      active: activeJobs.includes(p.url),
    })),
  };
}

async function buildDetailedStatus(startTime, reportPath) {
  const base = buildStatus(startTime);
  let recentSnapshots = [];

  try {
    const entries = await readReportEntries(reportPath);
    recentSnapshots = entries.slice(-10).reverse();
  } catch (_) {
    // report file may not exist yet
  }

  return {
    ...base,
    recentSnapshots,
  };
}

function formatStatusText(status) {
  const lines = [
    `pagesnap status`,
    `  running  : ${status.running}`,
    `  uptime   : ${status.uptime ?? 'n/a'}`,
    `  jobs     : ${status.activeJobs} active`,
    `  pages    : ${status.pageCount}`,
  ];
  if (status.pages.length > 0) {
    lines.push('  watched  :');
    for (const p of status.pages) {
      lines.push(`    [${p.active ? 'on ' : 'off'}] ${p.url}  (${p.schedule})`);
    }
  }
  return lines.join('\n');
}

module.exports = { getUptime, buildStatus, buildDetailedStatus, formatStatusText };
