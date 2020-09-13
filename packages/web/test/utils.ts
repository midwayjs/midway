import { IMidwayWebConfigurationOptions, Framework } from '../src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';

const logDir = join(__dirname, '../logs');
process.env.NODE_LOG_DIR = logDir;

export async function creatApp(name, options: IMidwayWebConfigurationOptions = {}) {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, Framework)
}

export async function closeApp(app) {
  return close(app);
}

export { createHttpRequest } from '@midwayjs/mock';
