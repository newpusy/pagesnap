# pagesnap

Minimal script to screenshot web pages on a schedule and diff visual changes.

## Installation

```bash
npm install -g pagesnap
```

## Usage

Create a `pagesnap.config.js` file in your project root:

```js
module.exports = {
  schedule: "0 * * * *", // every hour
  pages: [
    { name: "home", url: "https://example.com" },
    { name: "about", url: "https://example.com/about" },
  ],
  outputDir: "./snapshots",
};
```

Then run:

```bash
pagesnap start
```

Snapshots are saved to the output directory and compared against the previous capture. A diff image is generated whenever a visual change is detected.

### CLI Options

| Flag | Description |
|------|-------------|
| `--config <path>` | Path to config file (default: `pagesnap.config.js`) |
| `--once` | Run a single capture and exit |
| `--threshold <0-1>` | Diff sensitivity (default: `0.1`) |

## Requirements

- Node.js 16+
- Chromium (installed automatically via Puppeteer)

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

[MIT](LICENSE)