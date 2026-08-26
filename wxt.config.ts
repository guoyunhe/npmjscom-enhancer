import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    host_permissions: ['https://registry.npmjs.org/*'],
    browser_specific_settings: {
      gecko: {
        id: 'npmjscom-enhancer@guoyunhe.me',
        strict_min_version: '115.0',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  modules: ['@wxt-dev/module-react'],
  webExt: {
    startUrls: [
      'https://www.npmjs.com',
      'https://www.npmjs.com/search?q=lodash',
      'https://www.npmjs.com/package/lodash',
    ],
  },
});
