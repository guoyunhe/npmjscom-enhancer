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

    function createBundlephobiaBadge(name: string) {
      const a = document.createElement('a');
      a.href = `https://bundlephobia.com/package/${name}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.marginLeft = '4px';
      const img = document.createElement('img');
      img.src = `https://badgen.net/bundlephobia/minzip/${name}`;
      img.alt = 'Bundlephobia';
      img.loading = 'lazy';
      Object.assign(img.style, {
        height: '18px',
        verticalAlign: 'middle',
      });
      a.appendChild(img);
      return a;
    }

    function createSocketBadge(name: string) {
      const a = document.createElement('a');
      a.href = `https://socket.dev/npm/package/${name}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.marginLeft = '4px';
      const img = document.createElement('img');
      img.src = `https://badge.socket.dev/npm/package/${name}`;
      img.alt = 'Socket Security';
      img.loading = 'lazy';
      Object.assign(img.style, {
        height: '18px',
        verticalAlign: 'middle',
      });
      a.appendChild(img);
      return a;
    }

    function createEsmBadge(esm: boolean) {
      const img = document.createElement('img');
      img.src = esm
        ? 'https://img.shields.io/badge/ESM-yes-green'
        : 'https://img.shields.io/badge/ESM-no-red';
      img.alt = esm ? 'ESM: yes' : 'ESM: no';
      img.loading = 'lazy';
      Object.assign(img.style, {
        height: '18px',
        marginLeft: '4px',
        verticalAlign: 'middle',
      });
      return img;
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
        if (section && isOutdated(section)) {
          markOutdated(section);
        }

        getPackageInfo(name).then(({ types, dtTypes, esm }) => {
          let ref: Element = link;
          // TS/DT badge
          if (types) {
            ref = createBadge('TS', '#3178c6');
            link.after(ref);
          } else if (dtTypes) {
            ref = createBadge('DT', '#3178c6', true);
            link.after(ref);
          }
          // ESM badge
          const esmBadge = createEsmBadge(esm);
          ref.after(esmBadge);
          ref = esmBadge;
          // Bundlephobia badge
          const bpBadge = createBundlephobiaBadge(name);
          ref.after(bpBadge);
          ref = bpBadge;
          // Socket Security badge
          ref.after(createSocketBadge(name));
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

      const bpBadge = createBundlephobiaBadge(name);
      bpBadge.querySelector('img')!.style.height = '22px';
      bpBadge.style.marginLeft = '8px';
      header.appendChild(bpBadge);

      const socketBadge = createSocketBadge(name);
      socketBadge.querySelector('img')!.style.height = '22px';
      socketBadge.style.marginLeft = '8px';
      header.appendChild(socketBadge);
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
