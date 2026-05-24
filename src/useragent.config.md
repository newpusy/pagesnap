# User-Agent Configuration

Pagesnap lets you set a custom `User-Agent` header per page or globally. This is useful when target sites serve different content to bots, or when you need to simulate a specific browser.

## Config fields

| Field | Scope | Type | Default |
|-------|-------|------|---------|
| `userAgent` | global / page | `string` | built-in pagesnap UA |

## Presets

Use a short preset name instead of a full UA string:

| Preset | Description |
|--------|-------------|
| `chrome` | Desktop Chrome 124 |
| `firefox` | Desktop Firefox 125 |
| `safari` | Desktop Safari 17 |
| `mobile` | Android Chrome (Pixel 8) |
| `bot` | Minimal pagesnap bot string |

## Example

```json
{
  "userAgent": "chrome",
  "pages": [
    {
      "url": "https://example.com",
      "userAgent": "mobile"
    },
    {
      "url": "https://other.com",
      "userAgent": "Mozilla/5.0 (compatible; MyMonitor/1.0)"
    }
  ]
}
```

Page-level `userAgent` always overrides the global value. If neither is set, pagesnap uses its default UA.

## Notes

- Maximum length: 512 characters.
- Preset names are case-insensitive.
- Setting a realistic browser UA may bypass bot-detection on some sites.
