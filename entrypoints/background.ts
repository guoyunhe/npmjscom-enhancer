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

          sendResponse({
            ok: true,
            data: {
              types,
              dtTypes,
              esm: !!(data.type === 'module' || data.exports),
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
