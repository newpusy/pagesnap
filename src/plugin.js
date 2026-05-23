// plugin.js — load and run user-defined plugin hooks

const path = require('path');
const fs = require('fs');

const HOOK_NAMES = ['beforeCapture', 'afterCapture', 'onDiff', 'onError'];

function loadPlugin(pluginPath) {
  const resolved = path.resolve(pluginPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Plugin not found: ${resolved}`);
  }
  const plugin = require(resolved);
  validatePlugin(plugin);
  return plugin;
}

function validatePlugin(plugin) {
  if (typeof plugin !== 'object' || plugin === null) {
    throw new Error('Plugin must export a plain object');
  }
  for (const key of Object.keys(plugin)) {
    if (!HOOK_NAMES.includes(key)) {
      throw new Error(`Unknown plugin hook: "${key}". Valid hooks: ${HOOK_NAMES.join(', ')}`);
    }
    if (typeof plugin[key] !== 'function') {
      throw new Error(`Plugin hook "${key}" must be a function`);
    }
  }
}

async function runHook(plugin, hookName, context) {
  if (!plugin || typeof plugin[hookName] !== 'function') return context;
  const result = await plugin[hookName](context);
  return result !== undefined ? result : context;
}

function loadPlugins(pluginPaths = []) {
  return pluginPaths.map(loadPlugin);
}

async function runHookAll(plugins, hookName, context) {
  let ctx = context;
  for (const plugin of plugins) {
    ctx = await runHook(plugin, hookName, ctx);
  }
  return ctx;
}

module.exports = { loadPlugin, validatePlugin, runHook, loadPlugins, runHookAll, HOOK_NAMES };
