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
      console.log('Decorating package names...');
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/package/"]');

      const seen = new Set<string>();

      for (const link of links) {
        // Skip if already processed
        if (link.dataset.npmjsEnhancer) continue;
        link.dataset.npmjsEnhancer = '1';

        const name = link.getAttribute('href')!.replace('/package/', '');

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
      }
    }

    // Initial scan
    decoratePackageNames();

    // Observe DOM changes for dynamic loading
    const observer = new MutationObserver(() => {
      decoratePackageNames();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
});
