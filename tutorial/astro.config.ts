import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  base: process.env.TUTORIAL_BASE || '/',
  outDir: process.env.TUTORIAL_OUTDIR || 'dist',
  devToolbar: {
    enabled: false,
  },
  integrations: [tutorialkit()],
});
