import { IMidwayKoaConfigurationOptions, Framework, IMidwayKoaApplication } from '../src';
import { join } from 'path';
import { createApp, close } from '@midwayjs/mock';

export async function creatApp(name: string, options: IMidwayKoaConfigurationOptions = {}): Promise<IMidwayKoaApplication> {
  return createApp(join(__dirname, 'fixtures', name), options, Framework);
}

export async function closeApp(app) {
  return close(app);
}
