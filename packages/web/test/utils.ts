import { IMidwayWebConfigurationOptions, Framework } from '../src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';
import { remove } from 'fs-extra';

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

export async function creatApp(name, options: IMidwayWebConfigurationOptions = {}) {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, Framework)
}

export async function closeApp(app) {
  await close(app);
  if (process.env.EGG_HOME) {
    await remove(join(process.env.EGG_HOME, 'logs'));
  }
}

export { createHttpRequest } from '@midwayjs/mock';

export function getFilepath(p) {
  return join(__dirname, join('fixtures', p));
}

export const sleep = async (timeout = 1000) => {
  return new Promise(resolve =>  {
    setTimeout(resolve, timeout);
  });
}
