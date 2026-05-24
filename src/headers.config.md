# Custom Headers Configuration

Pagesnap supports setting custom HTTP request headers per page or globally.
Useful for authenticated pages, locale overrides, or internal staging flags.

## Config fields

### Global (top-level)

```json
{
  "headers": {
    "Accept-Language": "en-US",
    "X-Internal-Token": "secret"
  }
}
```

### Per-page override

```json
{
  "pages": [
    {
      "url": "https://example.com/admin",
      "headers": {
        "Authorization": "Bearer mytoken"
      }
    }
  ]
}
```

Page-level headers are merged with global headers. Page values take precedence on conflict.

## Notes

- All keys and values must be strings.
- Headers are applied before navigation using Puppeteer's `setExtraHTTPHeaders`.
- Sensitive values (e.g. tokens) should be sourced from environment variables if possible.
- Use `Authorization` for bearer tokens or basic auth.
