import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BlockEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'block-editor.js';
        return 'block-editor.cjs';
      },
    },
    rollupOptions: {
      // Keep heavy deps as external — they'll be loaded via dynamic import at runtime
      external: ['mermaid', 'katex'],
      output: {
        assetFileNames: 'style.css',
        globals: {
          mermaid: 'mermaid',
          katex: 'katex',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3300,
    open: '/demo/index.html',
  },
});
