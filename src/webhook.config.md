# Webhook Configuration

Pagesnap can POST a JSON payload to a URL of your choice whenever a visual change is detected.

## Global options (in `pagesnap.config.json`)

```json
{
  "webhookEnabled": true,
  "webhookUrl": "https://hooks.example.com/pagesnap",
  "webhookSecret": "optional-shared-secret",
  "webhookRetries": 2
}
```

## Per-page overrides

Any page entry can override the global webhook settings:

```json
{
  "pages": [
    {
      "url": "https://example.com",
      "webhookUrl": "https://hooks.example.com/special",
      "webhookEnabled": false
    }
  ]
}
```

## Payload format

```json
{
  "event": "visual_change",
  "url": "https://example.com",
  "slug": "example-com",
  "timestamp": "2024-06-01T12:00:00.000Z",
  "diffScore": 0.15,
  "snapshot": "snapshots/example-com/2024-06-01T12-00-00.png"
}
```

## Headers sent

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-Pagesnap-Event` | `visual_change` |
| `X-Pagesnap-Secret` | value of `webhookSecret` (if set) |

## Retries

Failed requests are retried up to `webhookRetries` times (default: 2). All attempts failing results in an error log entry but does not stop other jobs.
