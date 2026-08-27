export default defineContentScript({
  matches: ['*://www.npmjs.com/*'],
  async main() {
    const cache = new Map<string, { types: boolean; dtTypes: boolean; esm: boolean }>();

    async function getPackageInfo(name: string) {
      if (cache.has(name)) return cache.get(name)!;
      try {
        const res = await browser.runtime.sendMessage({
          type: 'FETCH_PACKAGE_INFO',
          name,
        });
        if (res.ok) {
          cache.set(name, res.data);
          return res.data as { types: boolean; dtTypes: boolean; esm: boolean };
        }
        throw new Error(res.error);
      } catch {
        const info = { types: false, dtTypes: false, esm: false };
        cache.set(name, info);
        return info;
      }
    }

    function createBadgeImg(src: string, alt: string, height = '18px') {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.loading = 'lazy';
      Object.assign(img.style, {
        display: 'block',
        height,
        marginLeft: '4px',
        verticalAlign: 'middle',
      });
      return img;
    }

    function createLinkBadge(href: string, imgSrc: string, alt: string, height = '18px') {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      Object.assign(a.style, {
        display: 'inline-block',
        marginLeft: '4px',
        verticalAlign: 'middle',
      });
      a.appendChild(createBadgeImg(imgSrc, alt, height));
      return a;
    }

    function createBundlephobiaBadge(name: string, height?: string) {
      return createLinkBadge(
        `https://bundlephobia.com/package/${name}`,
        `https://badgen.net/bundlephobia/minzip/${name}`,
        'Bundlephobia',
        height,
      );
    }

    function createSocketBadge(name: string, height?: string) {
      return createLinkBadge(
        `https://socket.dev/npm/package/${name}`,
        `https://badge.socket.dev/npm/package/${name}`,
        'Socket Security',
        height,
      );
    }

    function createNodeBadge(name: string, height?: string) {
      return createBadgeImg(`https://badgen.net/npm/node/${name}`, 'Node.js version', height);
    }

    function createTypesBadge(types: boolean, dtTypes: boolean, height?: string) {
      if (types) {
        return createBadgeImg(
          'https://badgen.net/badge/Types/yes/green',
          'TypeScript: built-in',
          height,
        );
      }
      if (dtTypes) {
        return createBadgeImg(
          'https://badgen.net/badge/Types/dt/yellow',
          'TypeScript: @types',
          height,
        );
      }
      return createBadgeImg('https://badgen.net/badge/Types/no/red', 'TypeScript: no', height);
    }

    function createEsmBadge(esm: boolean, height?: string) {
      return createBadgeImg(
        esm ? 'https://badgen.net/badge/ESM/yes/green' : 'https://badgen.net/badge/ESM/no/red',
        esm ? 'ESM: yes' : 'ESM: no',
        height,
      );
    }

    function isOutdated(section: HTMLElement): boolean {
      const text = section.textContent || '';
      const match = text.match(/(\d+)\s+years?\s+ago/);
      if (!match || !match[1]) return false;
      return parseInt(match[1], 10) >= 3;
    }

    function markOutdated(section: HTMLElement) {
      if (section.dataset.npmjsOutdated) return;
      section.dataset.npmjsOutdated = '1';
      section.style.opacity = '0.5';
      section.style.filter = 'grayscale(0.6)';
      section.title = 'This package has not been updated for over 3 years';
    }

    function decoratePackageNames() {
      const links = document.querySelectorAll<HTMLAnchorElement>('section a[href^="/package/"]');

      const seen = new Set<string>();

      for (const link of links) {
        // Skip if already processed
        if (link.dataset.npmjsEnhancer) continue;
        link.dataset.npmjsEnhancer = '1';

        const name = link.getAttribute('href')!.replace('/package/', '');

        // Skip @types/* packages
        if (name.startsWith('@types/')) continue;

        // Deduplicate: only process each package name once per scan
        if (seen.has(name)) continue;
        seen.add(name);

        // Check if the package is outdated (>3 years since last publish)
        const section = link.closest('section');
        const outdated = section && isOutdated(section);
        if (outdated) {
          markOutdated(section);
          continue;
        }

        getPackageInfo(name).then(({ types, dtTypes, esm }) => {
          const badges = [
            createTypesBadge(types, dtTypes),
            createEsmBadge(esm),
            createBundlephobiaBadge(name),
            createSocketBadge(name),
            createNodeBadge(name),
          ];
          let ref: Element = link;
          for (const badge of badges) {
            ref.after(badge);
            ref = badge;
          }
        });
      }
    }

    function decoratePackageDetail() {
      // Match the package detail page header
      const header = document.querySelector('h1');
      if (!header || header.dataset.npmjsEnhancerDetail) return;
      header.dataset.npmjsEnhancerDetail = '1';

      const pathMatch = location.pathname.match(/^\/package\/(.+)$/);
      if (!pathMatch || !pathMatch[1]) return;

      const name = pathMatch[1];

      // Skip @types/* packages
      if (name.startsWith('@types/')) return;

      // Check if the package is outdated (>3 years since last publish)
      const section = header.closest('section');
      if (section && isOutdated(section)) {
        markOutdated(section);
        return;
      }

      getPackageInfo(name).then(({ types, dtTypes, esm }) => {
        const DETAIL = { height: '22px', margin: '8px' };
        const badges = [
          createTypesBadge(types, dtTypes, DETAIL.height),
          createEsmBadge(esm, DETAIL.height),
          createBundlephobiaBadge(name, DETAIL.height),
          createSocketBadge(name, DETAIL.height),
          createNodeBadge(name, DETAIL.height),
        ];
        for (const badge of badges) {
          badge.style.marginLeft = DETAIL.margin;
          header.appendChild(badge);
        }
      });
    }

    // Initial scan
    decoratePackageNames();
    decoratePackageDetail();

    // Observe DOM changes for dynamic loading
    const observer = new MutationObserver(() => {
      decoratePackageNames();
      decoratePackageDetail();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
