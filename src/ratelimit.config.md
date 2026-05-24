# Rate Limit Configuration

Pagesnap can throttle how frequently each URL is captured and how many screenshots run concurrently.

## Global options (`rateLimit` in `pagesnap.config.json`)

```json
{
  "rateLimit": {
    "minIntervalMs": 5000,
    "maxConcurrent": 2
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `minIntervalMs` | number | `5000` | Minimum milliseconds between captures of the same URL |
| `maxConcurrent` | number | `2` | Maximum simultaneous browser captures |

## Per-URL override

Individual URLs can override the global rate limit:

```json
{
  "urls": [
    {
      "url": "https://example.com",
      "rateLimit": {
        "minIntervalMs": 10000,
        "maxConcurrent": 1
      }
    }
  ]
}
```

Per-URL values take precedence over global values. Any field not specified at the URL level falls back to the global setting.

## Notes

- Rate limiting state is held in memory and resets when pagesnap restarts.
- `maxConcurrent` applies process-wide, not per-URL.
- Set `minIntervalMs: 0` to disable interval throttling entirely.
