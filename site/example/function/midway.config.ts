import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: './src/apis',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
