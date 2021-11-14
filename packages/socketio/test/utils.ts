import { Framework, IMidwaySocketIOApplication, IMidwaySocketIOConfigurationOptions } from '../src';
import * as socketIO from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

/**
 * create a socket.io app
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwaySocketIOConfigurationOptions = {}): Promise<IMidwaySocketIOApplication> {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, socketIO);
}

export async function closeApp(app) {
  return close(app);
}
