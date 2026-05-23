# Audit Log

Pagesnap writes a newline-delimited JSON (NDJSON) audit log to `data/audit.ndjson` by default. Every capture attempt appends one entry regardless of success or failure.

## Entry Schema

| Field          | Type              | Description                              |
|----------------|-------------------|------------------------------------------|
| `ts`           | ISO 8601 string   | Timestamp of the capture attempt         |
| `url`          | string            | Target URL                               |
| `slug`         | string            | URL slug used for file naming            |
| `status`       | `ok` \| `error` \| `skipped` | Outcome of the capture        |
| `snapshotPath` | string \| null    | Path to the saved screenshot if captured |
| `error`        | string \| null    | Error message if status is `error`       |
| `durationMs`   | number \| null    | Time taken for the capture in ms         |

## Querying the Audit Log

Use the built-in CLI helper:

```bash
# Print all entries
node -e "require('./src/auditcli').runAuditCli()"

# Filter by status
node -e "require('./src/auditcli').runAuditCli(['--status', 'error'])"

# Filter by slug and show summary
node -e "require('./src/auditcli').runAuditCli(['--slug', 'example-com', '--summary'])"

# Show entries since a date
node -e "require('./src/auditcli').runAuditCli(['--since', '2024-06-01'])"
```

## Custom Path

Pass `--file <path>` to read from a non-default audit file.

## Retention

The audit log is append-only and not pruned automatically. Use `src/cleaner.js` patterns or a log rotation tool if the file grows too large.
