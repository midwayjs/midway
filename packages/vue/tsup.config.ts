import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  platform: 'neutral',
  target: 'es2020',
  external: ['vue', '@midwayjs/web-bridge'],
});
