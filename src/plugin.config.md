# Plugin Configuration

Pagesnap supports user-defined plugins to hook into the capture and diff lifecycle.

## Config

Add a `plugins` array to your `pagesnap.config.json`:

```json
{
  "plugins": [
    "./plugins/my-plugin.js",
    "./plugins/slack-notify.js"
  ]
}
```

Each entry is a path (relative to the config file) to a plugin module.

## Plugin Shape

A plugin is a plain JS object exporting one or more hook functions:

```js
module.exports = {
  async beforeCapture(ctx) {
    // ctx: { url, slug, config }
    return ctx; // must return context
  },
  async afterCapture(ctx) {
    // ctx: { url, slug, screenshotPath, config }
    return ctx;
  },
  async onDiff(ctx) {
    // ctx: { url, slug, changed, diffScore, config }
    return ctx;
  },
  async onError(ctx) {
    // ctx: { url, slug, error, config }
    return ctx;
  }
};
```

## Available Hooks

| Hook | When | Context |
|---|---|---|
| `beforeCapture` | Before screenshot is taken | `{ url, slug, config }` |
| `afterCapture` | After screenshot is saved | `{ url, slug, screenshotPath, config }` |
| `onDiff` | After diff is computed | `{ url, slug, changed, diffScore, config }` |
| `onError` | On any capture error | `{ url, slug, error, config }` |

## Notes

- Hooks are async and run in array order.
- Returning `undefined` from a hook preserves the existing context.
- Throwing inside a hook will abort the current job and trigger `onError`.
