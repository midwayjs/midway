import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node20',
  // 只排除 devDependencies 中的关键包
  external: ['joi', '@midwayjs/core'],
});
