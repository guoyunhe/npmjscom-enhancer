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
              esm,
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
