# Privacy Policy

**Effective Date:** 2026-08-26

## Overview

npmjs.com Enhancer is a browser extension that enhances the browsing experience on [npmjs.com](https://www.npmjs.com) by displaying package metadata badges (TypeScript support, ESM support, bundle size, and security score).

We take your privacy seriously. This policy explains what data the extension handles and how.

## Data Collection

**This extension does NOT collect, store, or transmit any personal data.**

- No user credentials, browsing history, or personal information is ever accessed.
- No analytics, telemetry, or tracking mechanisms are included.
- No cookies, local storage, or persistent storage is used.
- No data is sent to the developer or any third-party analytics service.

## Network Requests

The extension makes the following network requests solely to provide its functionality:

| Endpoint                       | Purpose                                              | Data Sent                            |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------ |
| `https://registry.npmjs.org/*` | Fetch package metadata (TypeScript/ESM declarations) | Package name from the npmjs.com page |
| `https://badgen.net/*`         | Load TypeScript, ESM, and bundle size badge images   | Package name (in URL path)           |
| `https://badge.socket.dev/*`   | Load Socket Security score badge                     | Package name (in URL path)           |
| `https://bundlephobia.com/*`   | Link to bundlephobia.com package page                | None (redirect via link click)       |

These requests are made only when you visit `www.npmjs.com` and are necessary to display the enhanced package information. No user-identifiable data is included in any request.

## Permissions

The extension requires the following permissions:

- **Host permission (`https://registry.npmjs.org/*`)**: Required to query npm package registry for TypeScript and ESM declarations.
- **Access to `www.npmjs.com`**: Required to inject UI enhancements (badges) into the npm website.

## Data Sharing

No data is shared with any third party. The developer does not receive or have access to any user data.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/guoyunhe/npmjscom-enhancer).
