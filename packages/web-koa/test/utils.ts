import { IMidwayKoaConfigurationOptions, Framework, IMidwayKoaApplication } from '../src';
import * as koaModule from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

export async function creatApp(name: string, options: IMidwayKoaConfigurationOptions = {}): Promise<IMidwayKoaApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), {
    imports: [
      koaModule,
    ],
    ...options,
  });
}

export async function closeApp(app) {
  return close(app);
}

export { createHttpRequest } from '@midwayjs/mock';
