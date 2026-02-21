import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/vite.ts', 'src/rspack.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node20',
  external: ['@midwayjs/api-bridge'],
});
