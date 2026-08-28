import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: 'dist/site', emptyOutDir: true, target: 'es2022' },
  server: { host: '127.0.0.1' }
});
