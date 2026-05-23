# Alert Configuration

Pagesnap can trigger alerts when a visual diff exceeds a configurable threshold.
Alert settings live under the `alert` key in `pagesnap.config.json`.

## Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable alerting entirely |
| `threshold` | number | `0.05` | Fraction of changed pixels (0–1) that triggers an alert |
| `cooldownMinutes` | number | `60` | Minimum minutes between repeated alerts for the same URL |

## Example

```json
{
  "alert": {
    "enabled": true,
    "threshold": 0.03,
    "cooldownMinutes": 120
  }
}
```

## Alert log

All evaluated diff results are appended to `alerts.ndjson` in the project root.
Each line is a JSON object:

```json
{"url":"https://example.com","diffRatio":0.08,"threshold":0.05,"triggered":true,"timestamp":"2024-01-15T10:30:00.000Z"}
```

## CLI

Inspect the alert log with:

```bash
node src/alertcli.js list
node src/alertcli.js list --triggered
node src/alertcli.js list --url https://example.com
node src/alertcli.js summary
```
