import { Framework, IMidwayWSApplication, IMidwayWSConfigurationOptions } from '../src';
import * as ws from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

/**
 * create a WebSocket app
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwayWSConfigurationOptions = {}): Promise<IMidwayWSApplication> {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, ws);
}

export async function closeApp(app) {
  return close(app);
}
