import { IMidwayWebConfigurationOptions, Framework } from '../../web/src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';
import { remove } from 'fs-extra';

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

export async function create(name, options: IMidwayWebConfigurationOptions = {}) {
  const baseDir = join(__dirname, 'fixtures', name);
  await remove(join(baseDir, 'logs'));
  await remove(join(baseDir, 'run'));
  return createApp<Framework>(baseDir, options, Framework)
}

export async function closeApp(app) {
  await remove(join(app.appDir, 'logs'));
  await remove(join(app.appDir, 'run'));
  await close(app);
}
