import { Framework, IMidwayRabbitMQApplication, IMidwayRabbitMQConfigurationOptions } from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

/**
 * create a socket.io app
 * @param name
 * @param options
 */
export async function creatApp(name: string, options: IMidwayRabbitMQConfigurationOptions): Promise<IMidwayRabbitMQApplication> {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, Framework);
}

export async function closeApp(app) {
  return close(app);
}
