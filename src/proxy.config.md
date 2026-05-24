# Proxy Configuration

Pagesnap supports routing screenshot requests through an HTTP/HTTPS proxy.

## Global Config (`pagesnap.config.json`)

```json
{
  "proxy": {
    "enabled": true,
    "url": "http://proxy.example.com:8080",
    "bypass": ["localhost", "127.0.0.1"],
    "rejectUnauthorized": true
  }
}
```

## Per-Page Override

Each page entry can override the global proxy settings:

```json
{
  "pages": [
    {
      "url": "https://internal.example.com",
      "proxy": {
        "enabled": false
      }
    }
  ]
}
```

## Options

| Field | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Enable proxy for requests |
| `url` | string | `null` | Proxy server URL including port |
| `bypass` | string[] | `[]` | Hosts to bypass the proxy |
| `rejectUnauthorized` | boolean | `true` | Reject invalid SSL certificates on proxy |

## Notes

- Proxy settings are passed as Chromium launch arguments.
- Set `rejectUnauthorized: false` only for trusted internal proxies.
- Page-level proxy config is merged on top of global config.
