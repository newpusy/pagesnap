import fs from 'fs';
import path from 'path';

/**
 * Send a notification about a visual change.
 * Currently supports: console, webhook, file log.
 */

export function formatNotification(reportEntry) {
  const { url, timestamp, diffPercent, diffImagePath } = reportEntry;
  return {
    title: 'pagesnap: visual change detected',
    url,
    timestamp,
    diffPercent: diffPercent ?? null,
    diffImagePath: diffImagePath ?? null,
    message: `Visual change detected on ${url} at ${timestamp}${
      diffPercent != null ? ` (${diffPercent.toFixed(2)}% changed)` : ''
    }`,
  };
}

export async function sendWebhook(webhookUrl, notification) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  if (!res.ok) {
    throw new Error(`Webhook request failed: ${res.status} ${res.statusText}`);
  }
  return res.status;
}

export function writeNotificationLog(logPath, notification) {
  const line = JSON.stringify(notification) + '\n';
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, line, 'utf8');
}

export async function notify(reportEntry, notifyConfig = {}) {
  const notification = formatNotification(reportEntry);

  if (notifyConfig.console !== false) {
    console.log('[pagesnap]', notification.message);
  }

  if (notifyConfig.webhookUrl) {
    await sendWebhook(notifyConfig.webhookUrl, notification);
  }

  if (notifyConfig.logPath) {
    writeNotificationLog(notifyConfig.logPath, notification);
  }

  return notification;
}
