# Throttle Configuration

Controls per-URL capture delays and automatic retry backoff.

## Options

### `throttle.delayMs` (number, default: `0`)
Milliseconds to wait before each capture attempt. Useful for polite crawling or avoiding rate limits on target sites.

### `throttle.backoffMs` (number, default: `2000`)
Base milliseconds to wait between retries on failure. Each retry multiplies this value by the attempt number (linear backoff).

### `throttle.maxRetries` (number, default: `3`)
Maximum number of retry attempts before a capture is marked as failed.

## Example

```json
{
  "throttle": {
    "delayMs": 250,
    "backoffMs": 1500,
    "maxRetries": 2
  },
  "pages": [
    {
      "url": "https://example.com",
      "throttle": {
        "delayMs": 1000
      }
    }
  ]
}
```

Per-page `throttle` settings override global ones. Any key not specified at the page level falls back to the global value.
