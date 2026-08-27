# Changelog

## [Unreleased]

### Added

- **Node.js version badge**: Display minimum Node.js version requirement badge via `badgen.net/npm/node/`.

## [0.1.0] - 2026-08-27

### Added

- **TypeScript badge**: Display built-in types (`TS`, green), `@types/*` package (`DT`, yellow), or no types (`no`, red) on search results and package detail page.
- **ESM badge**: Show `yes` (green) or `no` (red) for ESM module support on search results and package detail page.
- **Bundlephobia badge**: Display minified + gzip bundle size badge with link to bundlephobia.com.
- **Socket Security badge**: Show package quality score badge with link to socket.dev.
- **Outdated package dimming**: Packages not updated for over 3 years are dimmed (opacity + grayscale) in search results.
- i18n support with English, Simplified Chinese, and Traditional Chinese locales.

### Technical

- All badge images use [badgen.net](https://badgen.net) for consistent styling.
- `types` detection checks `types`/`typings` field and `exports.*.types` conditional exports.
- `esm` detection checks `type: "module"`, `module` field, and `exports.*.import` conditional exports.
- `@types/*` packages are skipped from all badge processing.
- Badges use `display: block` on `<img>` and `display: inline-block` on parent `<a>` to avoid alignment issues.
- MutationObserver watches for DOM changes to handle dynamically loaded content.
