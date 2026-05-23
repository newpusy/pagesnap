/**
 * watcher.js
 * Watches the config file for changes and triggers a reload + job restart.
 */

const fs = require('fs');
const path = require('path');
const { loadConfig, validateConfig } = require('./config');
const { startJobs, stopJobs } = require('./jobmanager');

let watcher = null;
let debounceTimer = null;
const DEBOUNCE_MS = 500;

function onConfigChange(configPath, onChange) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const raw = loadConfig(configPath);
      const config = validateConfig(raw);
      if (typeof onChange === 'function') {
        await onChange(config);
      }
    } catch (err) {
      console.error('[watcher] Failed to reload config:', err.message);
    }
  }, DEBOUNCE_MS);
}

function watchConfig(configPath, onChange) {
  const resolved = path.resolve(configPath);

  if (watcher) {
    stopWatching();
  }

  watcher = fs.watch(resolved, (eventType) => {
    if (eventType === 'change') {
      console.log('[watcher] Config changed, reloading...');
      onConfigChange(resolved, onChange);
    }
  });

  watcher.on('error', (err) => {
    console.error('[watcher] Watch error:', err.message);
  });

  console.log(`[watcher] Watching ${resolved}`);
  return watcher;
}

function stopWatching() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log('[watcher] Stopped watching config.');
  }
  clearTimeout(debounceTimer);
}

function isWatching() {
  return watcher !== null;
}

module.exports = { watchConfig, stopWatching, isWatching };
