# Retention Policy Configuration

Pagesnap supports configurable snapshot retention policies to automatically clean up old screenshots.

## Configuration

Add a `retention` key to your `pagesnap.config.json`:

```json
{
  "retention": {
    "maxAgeDays": 30,
    "maxCount": 100,
    "keepOnChange": true
  }
}
```

## Options

| Key | Type | Default | Description |
|---|---|---|---|
| `maxAgeDays` | number | `30` | Delete snapshots older than this many days |
| `maxCount` | number | `100` | Maximum snapshots to keep per URL slug |
| `keepOnChange` | boolean | `true` | Always keep snapshots where a visual diff was detected |

## Behaviour

- Retention is applied **per slug** (i.e. per tracked URL).
- Files are evaluated by timestamp embedded in the filename.
- Expiry by age is applied first, then count-based overflow pruning.
- When `keepOnChange` is `true`, snapshots flagged as changed in the report are exempt from pruning (future enhancement).

## Running manually

Retention can be triggered via the CLI:

```bash
node src/cli.js retention
```

This will apply the configured policy to all known slugs in the snapshot directory.
