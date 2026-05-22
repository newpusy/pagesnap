const cron = require('node-cron');

const activeJobs = new Map();

/**
 * Validate that a cron expression is valid
 * @param {string} expression
 * @returns {boolean}
 */
function isValidCronExpression(expression) {
  return cron.validate(expression);
}

/**
 * Schedule a task for a given page config
 * @param {object} page - page config with url, schedule, name
 * @param {function} task - async function to run on schedule
 * @returns {string} job id
 */
function scheduleJob(page, task) {
  const { name, url, schedule } = page;

  if (!isValidCronExpression(schedule)) {
    throw new Error(`Invalid cron expression "${schedule}" for page: ${name || url}`);
  }

  const jobId = name || url;

  if (activeJobs.has(jobId)) {
    console.warn(`Job already exists for "${jobId}", skipping duplicate.`);
    return jobId;
  }

  const job = cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Running snapshot for: ${jobId}`);
    try {
      await task(page);
    } catch (err) {
      console.error(`Snapshot failed for "${jobId}":`, err.message);
    }
  });

  activeJobs.set(jobId, job);
  console.log(`Scheduled "${jobId}" with cron: ${schedule}`);
  return jobId;
}

/**
 * Stop and remove a scheduled job
 * @param {string} jobId
 */
function cancelJob(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) {
    console.warn(`No job found for id: ${jobId}`);
    return false;
  }
  job.stop();
  activeJobs.delete(jobId);
  return true;
}

/**
 * Stop all active jobs
 */
function cancelAllJobs() {
  for (const [jobId, job] of activeJobs.entries()) {
    job.stop();
    activeJobs.delete(jobId);
  }
  console.log('All scheduled jobs stopped.');
}

/**
 * Get list of active job ids
 * @returns {string[]}
 */
function getActiveJobIds() {
  return Array.from(activeJobs.keys());
}

module.exports = { scheduleJob, cancelJob, cancelAllJobs, getActiveJobIds, isValidCronExpression };
