export default defineContentScript({
  matches: ['*://www.npmjs.com/*'],
  async main() {
    const cache = new Map<string, { esm: boolean }>();

    async function getPackageInfo(name: string) {
      if (cache.has(name)) return cache.get(name)!;
      try {
        const res = await browser.runtime.sendMessage({
          type: 'FETCH_PACKAGE_INFO',
          name,
        });
        if (res.ok) {
          cache.set(name, res.data);
          return res.data as { esm: boolean };
        }
        throw new Error(res.error);
      } catch {
        const info = { esm: false };
        cache.set(name, info);
        return info;
      }
    }

    function createBadgeImg(src: string, alt: string) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.loading = 'lazy';
      img.style.display = 'block';
      return img;
    }

    function createLinkBadge(href: string, imgSrc: string, alt: string) {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.appendChild(createBadgeImg(imgSrc, alt));
      return a;
    }

    function wrapBadges(badges: HTMLElement[], gap = '4px') {
      const wrapper = document.createElement('span');
      Object.assign(wrapper.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        verticalAlign: 'middle',
      });
      for (const badge of badges) wrapper.appendChild(badge);
      return wrapper;
    }

    function createBundlephobiaBadge(name: string) {
      return createLinkBadge(
        `https://bundlephobia.com/package/${name}`,
        `https://badgen.net/bundlephobia/minzip/${name}`,
        'Bundlephobia',
      );
    }

    function createSocketBadge(name: string) {
      return createLinkBadge(
        `https://socket.dev/npm/package/${name}`,
        `https://badge.socket.dev/npm/package/${name}`,
        'Socket Security',
      );
    }

    function createNodeBadge(name: string) {
      return createBadgeImg(`https://badgen.net/npm/node/${name}`, 'Node.js version');
    }

    function createTypesBadge(name: string) {
      return createBadgeImg(`https://badgen.net/npm/types/${name}`, 'TypeScript types');
    }

    function createEsmBadge(esm: boolean) {
      return createBadgeImg(
        esm ? 'https://badgen.net/badge/esm/yes/green' : 'https://badgen.net/badge/esm/no/red',
        esm ? 'ESM: yes' : 'ESM: no',
      );
    }

    function createDepCountBadge(name: string) {
      return createBadgeImg(
        `https://badgen.net/bundlephobia/dependency-count/${name}`,
        'Dependency count',
      );
    }

    function createTreeShakingBadge(name: string) {
      return createBadgeImg(`https://badgen.net/bundlephobia/tree-shaking/${name}`, 'Tree shaking');
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

        getPackageInfo(name).then(({ esm }) => {
          const wrapper = wrapBadges([
            createTypesBadge(name),
            createEsmBadge(esm),
            createDepCountBadge(name),
            createTreeShakingBadge(name),
            createBundlephobiaBadge(name),
            createSocketBadge(name),
            createNodeBadge(name),
          ]);
          wrapper.style.marginTop = '8px';
          link.parentElement!.after(wrapper);
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

      getPackageInfo(name).then(({ esm }) => {
        const wrapper = wrapBadges(
          [
            createTypesBadge(name),
            createEsmBadge(esm),
            createDepCountBadge(name),
            createTreeShakingBadge(name),
            createBundlephobiaBadge(name),
            createSocketBadge(name),
            createNodeBadge(name),
          ],
          '8px',
        );
        header.appendChild(wrapper);
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
