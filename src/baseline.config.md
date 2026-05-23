# Baseline Configuration

Pagesnap supports pinning a **baseline** snapshot for each tracked URL. Diffs are computed against the baseline rather than the previous snapshot when a baseline is set.

## Config fields

Add to `pagesnap.config.json`:

```json
{
  "baselineDir": "baselines"
}
```

| Field         | Type   | Default      | Description                              |
|---------------|--------|--------------|------------------------------------------|
| `baselineDir` | string | `baselines`  | Directory where baseline PNGs are stored |

## CLI usage

```
node src/baselinecli.js <command> [slug]
```

### Commands

| Command         | Description                                      |
|-----------------|--------------------------------------------------|
| `list`          | List all slugs that have a baseline set          |
| `set <slug>`    | Copy the latest snapshot as the baseline         |
| `clear <slug>`  | Remove the baseline for a slug                   |
| `check <slug>`  | Report whether a baseline exists for a slug      |

## Notes

- Baselines are plain PNG files named `<slug>.baseline.png` inside `baselineDir`.
- If no baseline is set for a slug, pagesnap falls back to comparing against the previous snapshot as normal.
- Run `set` after a deliberate visual change to accept the new look as the reference point.
