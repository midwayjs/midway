import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node20',
  external: ['react', 'react-dom', '@midwayjs/web-bridge'],
});
