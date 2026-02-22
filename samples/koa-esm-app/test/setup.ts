import { createApp, close } from '@midwayjs/mock';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app;
export async function mochaGlobalSetup() {
  // create app
  app = await createApp({
    appDir: join(__dirname, '../'),
  });
}

export async function mochaGlobalTeardown() {
  await close(app);
};

export function getApp() {
  return app;
}
