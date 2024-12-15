import { Framework, IMidwayKafkaApplication } from '../src';
import * as kafka from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a kafka app
 * @param name
 * @param options
 */
export async function creatApp(name: string, options?: any): Promise<IMidwayKafkaApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), Object.assign({
    imports: [kafka]
  }, options));
}

export async function closeApp(app) {
  return close(app);
}
