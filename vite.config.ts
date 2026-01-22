import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  define: {
    // vue-i18nのDevToolsを無効化（Web Component環境でのエラーを回避）
    // ビルド時に確実に無効化するため、すべての関連フラグを設定
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
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/__tests__/**/*']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ZeroCode',
      formats: ['es', 'umd'],
      fileName: (format) => `zerocode.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'jsdom'], // Vueは使用者側で提供、jsdomはサーバーサイドでのみ使用
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          if (assetInfo.name === 'zcode-cms.css') return 'zcode-cms.css';
          return assetInfo.name || '';
        }
      }
    },
    sourcemap: false,
    copyPublicDir: false,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['monaco-editor', '@monaco-editor/loader']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
