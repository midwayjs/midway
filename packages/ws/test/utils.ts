import { Framework, IMidwayWSApplication, IMidwayWSConfigurationOptions } from '../src';
import * as ws from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a WebSocket app
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwayWSConfigurationOptions = {}): Promise<IMidwayWSApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), Object.assign({
    imports: [ws]
  }, options));
}

export async function closeApp(app) {
  return close(app);
}
