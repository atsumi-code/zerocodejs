import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ssr-entry.ts'),
      name: 'ZeroCodeSSR',
      formats: ['es'],
      fileName: () => 'zerocode-ssr.es.js'
    },
    rollupOptions: {
      external: ['jsdom'],
      output: {
        format: 'es'
      }
    },
    sourcemap: false,
    copyPublicDir: false,
    minify: 'esbuild',
    outDir: 'dist',
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
