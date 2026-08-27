# npmjs.com Enhancer

[![Chrome Web Store](https://badgen.net/chrome-web-store/users/phbbcgflfmijkejdlipbkkecakgkfddb?label=chrome-users)](https://chrome.google.com/webstore/detail/npmjscom-enhancer/phbbcgflfmijkejdlipbkkecakgkfddb)
[![Firefox Add-ons](https://badgen.net/amo/users/npmjscom-enhancer?label=firefox-users)](https://addons.mozilla.org/firefox/addon/npmjscom-enhancer/)

A browser extension that enriches the [npmjs.com](https://www.npmjs.com) browsing experience with inline quality-of-life badges and visual cues — helping you evaluate packages at a glance.

---

## Features

### Badges

Every package listing and detail page gets a set of informative badges:

| Badge               | Description                                                                    | Source                                       |
| ------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| **TypeScript**      | Built-in types (green), `@types/*` available (yellow), or none (red)           | npm registry                                 |
| **ESM**             | Native ESM support via `type: "module"` or `exports.*.import`                  | npm registry                                 |
| **Dependencies**    | Total dependency count (dependencies + peerDependencies), color-coded by count | npm registry                                 |
| **Bundle Size**     | Minified + gzipped bundle size, clickable link to Bundlephobia                 | [bundlephobia.com](https://bundlephobia.com) |
| **Socket Security** | Package quality & security score, clickable link to Socket                     | [socket.dev](https://socket.dev)             |
| **Node.js**         | Minimum required Node.js version                                               | [badgen.net](https://badgen.net)             |

### Visual Cues

- **Outdated package dimming** — Packages with no updates for 3+ years are visually dimmed (reduced opacity + grayscale) in search results and excluded from badge display.

### Smart Filtering

- `@types/*` packages are automatically skipped from all badge processing.
- Duplicate package names in search results are handled correctly.

---

## Installation

Install from your browser's extension store:

- [Chrome Web Store](https://chrome.google.com/webstore/detail/npmjscom-enhancer/phbbcgflfmijkejdlipbkkecakgkfddb)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/npmjscom-enhancer/)

---

## Screenshots

### Search Results

![search result](./screenshots/search.png)

### Package Detail

![package detail](./screenshots/package.png)

---

## How It Works

1. **Detection** — The extension queries the npm registry (`registry.npmjs.org/<name>/latest`) to detect TypeScript support, ESM compatibility, and dependency count.
2. **Rendering** — Badge images are served via [badgen.net](https://badgen.net) for consistent styling and lazy-loaded for performance.
3. **DOM Observation** — A `MutationObserver` watches for dynamic content changes, ensuring badges appear on SPA navigation and infinite scroll.

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (Chrome)
pnpm dev

# Start dev server (Firefox)
pnpm dev:firefox

# Build for production
pnpm build

# Type-check
pnpm compile

# Format code
pnpm format
```

### Tech Stack

- [WXT](https://wxt.dev) — Browser extension framework
- [React](https://react.dev) — Popup UI
- [TypeScript](https://www.typescriptlang.org) — Type-safe codebase
- [badgen.net](https://badgen.net) — Badge image service

---

## License

[MIT](./LICENSE) © [Guo Yunhe](https://guoyunhe.me/)
