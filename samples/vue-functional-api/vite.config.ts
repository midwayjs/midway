import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { apiPlugin } from '@midwayjs/web-bridge/vite';
import { devPlugin } from '@midwayjs/mock/vite';
import { apiBridgeConfig } from './src/web/api/client';

export default defineConfig({
  build: {
    outDir: 'dist/web',
  },
  plugins: [
    devPlugin({
      appDir: fileURLToPath(new URL('.', import.meta.url)),
      baseDir: fileURLToPath(new URL('./src/server', import.meta.url)),
      basePath: apiBridgeConfig.browserBasePath,
    }),
    vue(),
    apiPlugin({
      root: fileURLToPath(new URL('.', import.meta.url)),
      apiDir: apiBridgeConfig.apiDir,
      target: 'both',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
