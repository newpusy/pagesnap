const path = require('path');
const os = require('os');
const fs = require('fs');
const { loadPlugin, validatePlugin, runHook, loadPlugins, runHookAll } = require('./plugin');

function writeTempPlugin(obj) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-'));
  const file = path.join(dir, 'plugin.js');
  fs.writeFileSync(file, `module.exports = ${JSON.stringify(obj).replace(/"(\w+)":/g, '$1:')};`);
  return file;
}

function writeTempPluginFn(hooks) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-'));
  const file = path.join(dir, 'plugin.js');
  const lines = ['module.exports = {'];
  for (const [k, body] of Object.entries(hooks)) {
    lines.push(`  async ${k}(ctx) { ${body} },`);
  }
  lines.push('};');
  fs.writeFileSync(file, lines.join('\n'));
  return file;
}

test('loadPlugin throws if file missing', () => {
  expect(() => loadPlugin('/nonexistent/plugin.js')).toThrow('Plugin not found');
});

test('validatePlugin throws on unknown hook', () => {
  expect(() => validatePlugin({ unknownHook: () => {} })).toThrow('Unknown plugin hook');
});

test('validatePlugin throws if hook is not a function', () => {
  expect(() => validatePlugin({ beforeCapture: 'nope' })).toThrow('must be a function');
});

test('validatePlugin accepts valid hooks', () => {
  expect(() => validatePlugin({ beforeCapture: async () => {} })).not.toThrow();
});

test('runHook returns context unchanged if hook absent', async () => {
  const ctx = { url: 'https://example.com' };
  const result = await runHook({}, 'beforeCapture', ctx);
  expect(result).toEqual(ctx);
});

test('runHook applies hook transformation', async () => {
  const plugin = { beforeCapture: async (ctx) => ({ ...ctx, modified: true }) };
  const result = await runHook(plugin, 'beforeCapture', { url: 'x' });
  expect(result.modified).toBe(true);
});

test('loadPlugins loads multiple plugins', () => {
  const f1 = writeTempPluginFn({ afterCapture: 'return ctx;' });
  const f2 = writeTempPluginFn({ onDiff: 'return ctx;' });
  const plugins = loadPlugins([f1, f2]);
  expect(plugins).toHaveLength(2);
});

test('runHookAll chains plugins in order', async () => {
  const p1 = { beforeCapture: async (ctx) => ({ ...ctx, step: (ctx.step || 0) + 1 }) };
  const p2 = { beforeCapture: async (ctx) => ({ ...ctx, step: ctx.step + 10 }) };
  const result = await runHookAll([p1, p2], 'beforeCapture', { step: 0 });
  expect(result.step).toBe(11);
});
