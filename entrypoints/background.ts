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
          // Parse GitHub repo from repository field
          let githubRepo = '';
          const repo = data.repository;
          if (repo) {
            const url = typeof repo === 'string' ? repo : repo.url || '';
            const match = url.match(/github\.com[/:]([^/]+\/[^/.]+?)(?:\.git)?$/);
            if (match) githubRepo = match[1];
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
              esm,
              githubRepo,
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
