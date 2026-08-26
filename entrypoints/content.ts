function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default defineContentScript({
  matches: ['*://www.npmjs.com/*'],
  async main() {
    const cache = new Map<string, { types: boolean; dtTypes: boolean; esm: boolean }>();
    const bpCache = new Map<string, { size: number; gzip: number }>();

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

    async function getBundlephobiaInfo(name: string) {
      if (bpCache.has(name)) return bpCache.get(name)!;
      try {
        const res = await browser.runtime.sendMessage({
          type: 'FETCH_BUNDLEPHOBIA_INFO',
          name,
        });
        if (res.ok) {
          bpCache.set(name, res.data);
          return res.data as { size: number; gzip: number };
        }
        throw new Error(res.error);
      } catch {
        const info = { size: 0, gzip: 0 };
        bpCache.set(name, info);
        return info;
      }
    }

    function createBadge(label: string, bg: string, outline = false) {
      const span = document.createElement('span');
      Object.assign(span.style, {
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: '400',
        lineHeight: '1',
        padding: outline ? '1px 4px' : '2px 5px',
        borderRadius: '3px',
        color: outline ? bg : '#fff',
        backgroundColor: outline ? 'transparent' : bg,
        border: outline ? `1.5px solid ${bg}` : 'none',
        marginLeft: '4px',
        verticalAlign: 'middle',
      });
      span.textContent = label;
      return span;
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

        getPackageInfo(name).then(({ types, dtTypes, esm }) => {
          if (types) {
            link.after(createBadge('TS', '#3178c6'));
          } else if (dtTypes) {
            link.after(createBadge('DT', '#3178c6', true));
          }
          if (esm) {
            link.after(createBadge('ESM', '#4caf50'));
          }
        });

        getBundlephobiaInfo(name).then(({ gzip }) => {
          if (gzip > 0) {
            link.after(createBadge(formatSize(gzip), '#e65100'));
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
      if (!pathMatch) return;

      const name = pathMatch[1];

      // Skip @types/* packages
      if (name.startsWith('@types/')) return;

      getBundlephobiaInfo(name).then(({ gzip }) => {
        if (gzip > 0) {
          const badge = createBadge(formatSize(gzip), '#e65100');
          badge.style.fontSize = '14px';
          badge.style.padding = '3px 6px';
          badge.style.marginLeft = '8px';
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
