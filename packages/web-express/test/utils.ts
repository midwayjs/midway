import { IMidwayExpressConfigurationOptions, Framework, IMidwayExpressApplication } from '../src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';

export async function creatApp(name: string, options: IMidwayExpressConfigurationOptions = {}): Promise<IMidwayExpressApplication> {
  return createApp(join(__dirname, 'fixtures', name), options, Framework);
}

export async function closeApp(app) {
  return close(app);
}

export { createHttpRequest } from '@midwayjs/mock';
