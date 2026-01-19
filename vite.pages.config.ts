import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  define: {
    __VUE_I18N_FULL_INSTALL__: false,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
    __VUE_I18N_PROD_DEVTOOLS__: false
  },
  plugins: [
    vue({
      customElement: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('zcode-')
        }
      }
    })
  ],
  build: {
    outDir: 'dist-pages',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs.html'),
        testDev: resolve(__dirname, 'test-dev.html'),
        testCms: resolve(__dirname, 'test-cms.html'),
        testPub: resolve(__dirname, 'test-pub.html'),
        testSsr: resolve(__dirname, 'test-ssr.html'),
        testLightDom: resolve(__dirname, 'test-light-dom.html')
      }
    }
  }
});

