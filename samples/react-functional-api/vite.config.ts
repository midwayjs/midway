import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { apiPlugin } from '@midwayjs/react/vite';
import { devPlugin } from '@midwayjs/mock/vite';
import { apiBridgeConfig } from './src/web/api/client';

export default defineConfig({
  plugins: [
    devPlugin({
      appDir: fileURLToPath(new URL('.', import.meta.url)),
      baseDir: fileURLToPath(new URL('./src/server', import.meta.url)),
      basePath: apiBridgeConfig.basePath,
    }),
    react(),
    apiPlugin({
      root: fileURLToPath(new URL('.', import.meta.url)),
      apiDir: apiBridgeConfig.apiDir,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@midwayjs/react': fileURLToPath(
        new URL('../../packages/react/src/index.ts', import.meta.url)
      ),
      '@midwayjs/react/vite': fileURLToPath(
        new URL('../../packages/react/src/vite.ts', import.meta.url)
      ),
      '@midwayjs/mock/vite': fileURLToPath(
        new URL('../../packages/mock/src/vite.ts', import.meta.url)
      ),
      '@midwayjs/api-bridge': fileURLToPath(
        new URL('../../packages/api-bridge/src/index.ts', import.meta.url)
      ),
      '@midwayjs/core/functional': fileURLToPath(
        new URL('../../packages/core/src/functional/index.ts', import.meta.url)
      ),
    },
  },
});
