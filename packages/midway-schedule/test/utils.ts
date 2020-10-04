import { IMidwayWebConfigurationOptions, Framework } from '../../web/src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';

export async function create(name, options: IMidwayWebConfigurationOptions = {}) {
  const baseDir = join(__dirname, 'fixtures', name);
  return createApp<Framework>(baseDir, options, Framework)
}

export async function closeApp(app) {
  await close(app);
}
