import { Framework, Application, IMidwaySocketIOOptions } from '../src';
import * as socketIO from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a socket.io app
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwaySocketIOOptions = {}): Promise<Application> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), {
    imports: [
      socketIO,
    ],
    ...options,
  });
}

export async function closeApp(app) {
  return close(app);
}
