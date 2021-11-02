import { Framework, IMidwayRabbitMQApplication, IMidwayRabbitMQConfigurationOptions } from '../src';
import * as rabbitmq from '../src';
import { join } from 'path';
import { close, createApp } from '@midwayjs/mock';

/**
 * create a rabbitMQ app
 * @param name
 * @param options
 */
export async function creatApp(name: string, options?: IMidwayRabbitMQConfigurationOptions): Promise<IMidwayRabbitMQApplication> {
  return createApp<Framework>(join(__dirname, 'fixtures', name), options, rabbitmq);
}

export async function closeApp(app) {
  return close(app);
}
