# Auth Configuration

Pagesnap supports HTTP Basic Auth and Bearer Token authentication, configurable globally or per page.

## Config Fields

```json
{
  "auth": {
    "type": "basic",
    "username": "admin",
    "password": "secret"
  }
}
```

or for bearer tokens:

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-api-token-here"
  }
}
```

## Options

| Field      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `type`     | string | `"basic"` or `"bearer"`                  |
| `username` | string | Username (basic auth only)               |
| `password` | string | Password (basic auth only)               |
| `token`    | string | Bearer token (bearer auth only)          |

## Scope

Auth can be set globally under the top-level `auth` key, or overridden per page entry. Page-level auth takes full precedence over global auth.

## Notes

- Credentials are injected as HTTP headers via Puppeteer's `setExtraHTTPHeaders`.
- Avoid committing credentials directly; use environment variable substitution if supported.
- Bearer tokens are sent as `Authorization: Bearer <token>`.
