# Notify Configuration

The `notify` block in `pagesnap.config.json` controls how pagesnap alerts you when a visual change is detected.

## Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `console` | boolean | `true` | Print a message to stdout on each change |
| `webhookUrl` | string | — | HTTP POST endpoint to receive change payloads |
| `logPath` | string | — | File path to append JSON notification lines |

## Example

```json
{
  "notify": {
    "console": true,
    "webhookUrl": "https://hooks.slack.com/services/XXX/YYY/ZZZ",
    "logPath": "./snapshots/notify.log"
  }
}
```

## Webhook Payload

When `webhookUrl` is set, pagesnap sends a `POST` request with `Content-Type: application/json`:

```json
{
  "title": "pagesnap: visual change detected",
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "diffPercent": 3.14,
  "diffImagePath": "snapshots/diff/example-com.png",
  "message": "Visual change detected on https://example.com at 2024-01-15T10:00:00.000Z (3.14% changed)"
}
```

## Log File

Each line in the log file is a newline-delimited JSON object with the same shape as the webhook payload.
