# npmjs.com Enhancer

[![Chrome Web Store](https://badgen.net/chrome-web-store/users/phbbcgflfmijkejdlipbkkecakgkfddb?label=chrome-users)](https://chrome.google.com/webstore/detail/npmjscom-enhancer/phbbcgflfmijkejdlipbkkecakgkfddb)
[![Firefox Add-ons](https://badgen.net/amo/users/npmjscom-enhancer?label=firefox-users)](https://addons.mozilla.org/firefox/addon/npmjscom-enhancer/)

A browser extension that enriches the [npmjs.com](https://www.npmjs.com) browsing experience with inline quality-of-life badges and visual cues — helping you evaluate packages at a glance.

---

## Features

- **TypeScript badge** — Auto-detected type status (built-in, `@types/*`, or none) via `badgen.net/npm/types/`
- **ESM badge** — Native ESM support via `type: "module"` or `exports.*.import`
- **Dependency count badge** — Total dependency count via `badgen.net/bundlephobia/dependency-count/`
- **Tree shaking badge** — Tree-shaking support via `badgen.net/bundlephobia/tree-shaking/`
- **Install size badge** — Package install size via `badgen.net/packagephobia/install/`
- **Bundle size badge** — Minified + gzipped size, clickable link to [Bundlephobia](https://bundlephobia.com)
- **GitHub stars badge** — Star count from the package's GitHub repository
- **GitHub forks badge** — Fork count from the package's GitHub repository
- **Socket Security badge** — Package quality & security score, clickable link to [Socket](https://socket.dev)
- **Node.js version badge** — Minimum required Node.js version
- **Outdated package dimming** — Packages with no updates for 3+ years are dimmed and excluded from badges
- **Smart filtering** — `@types/*` packages are skipped; duplicate search results are handled correctly

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

1. **Detection** — The extension queries the npm registry (`registry.npmjs.org/<name>/latest`) to detect ESM compatibility and parse the GitHub repository URL.
2. **Rendering** — Badge images are served via [badgen.net](https://badgen.net) and [badge.socket.dev](https://socket.dev) for consistent styling and lazy-loaded for performance.
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
