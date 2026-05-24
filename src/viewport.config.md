# Viewport Configuration

Control the browser viewport size and device emulation for screenshots.

## Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `width` | number | `1280` | Viewport width in pixels (1–7680) |
| `height` | number | `800` | Viewport height in pixels (1–4320) |
| `deviceScaleFactor` | number | `1` | Device pixel ratio (0.1–4) |
| `isMobile` | boolean | `false` | Emulate a mobile device |

## Scope

Viewport can be set globally or per-page. Page-level config takes priority.

## Example

```json
{
  "viewport": {
    "width": 1440,
    "height": 900,
    "deviceScaleFactor": 2
  },
  "pages": [
    {
      "url": "https://example.com/mobile",
      "viewport": {
        "width": 375,
        "height": 812,
        "isMobile": true
      }
    }
  ]
}
```

## Notes

- `deviceScaleFactor: 2` is useful for retina-quality screenshots.
- Mobile emulation affects touch events and `navigator.userAgent` in some browsers.
- Viewport is applied before the page loads.
