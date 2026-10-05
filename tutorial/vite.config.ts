import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tutorialContent } from './build/plugin.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

// StackBlitz 嵌入依赖跨域隔离，线上由 CDN 为 /tutorial/ 路径添加同样的响应头。
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

export default defineConfig({
  base: process.env.TUTORIAL_BASE || '/tutorial/',
  plugins: [react(), tutorialContent(root)],
  server: { port: 5180, headers: isolationHeaders },
  preview: { port: 5180, headers: isolationHeaders },
});
