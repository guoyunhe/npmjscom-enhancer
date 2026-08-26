export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'FETCH_PACKAGE_INFO') {
      const { name } = message;
      fetch(`https://registry.npmjs.org/${name}/latest`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(async (data) => {
          const types = !!(data.types || data.typings);
          let dtTypes = false;

          if (!types) {
            // Check if @types/<name> exists
            const dtRes = await fetch(`https://registry.npmjs.org/@types/${name}`);
            dtTypes = dtRes.ok;
          }

          // Check ESM: type=module, module field, or exports.*.import
          let esm = data.type === 'module' || !!data.module;
          if (!esm && data.exports) {
            const checkExports = (obj: unknown): boolean => {
              if (!obj || typeof obj !== 'object') return false;
              for (const [key, val] of Object.entries(obj)) {
                if (key === 'import') return true;
                if (val && typeof val === 'object') {
                  if (checkExports(val)) return true;
                }
              }
              return false;
            };
            esm = checkExports(data.exports);
          }

          sendResponse({
            ok: true,
            data: {
              types,
              dtTypes,
              esm,
            },
          });
        })
        .catch((err) => {
          sendResponse({ ok: false, error: String(err) });
        });
      return true;
    }

    if (message.type === 'FETCH_BUNDLEPHOBIA_INFO') {
      const { name } = message;
      fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(name)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          sendResponse({
            ok: true,
            data: {
              size: data.size as number,
              gzip: data.gzip as number,
            },
          });
        })
        .catch((err) => {
          sendResponse({ ok: false, error: String(err) });
        });
      return true;
    }
  });
});
