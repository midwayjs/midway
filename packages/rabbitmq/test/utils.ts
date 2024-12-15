import { Framework, IMidwayRabbitMQApplication, IMidwayRabbitMQConfigurationOptions } from '../src';
import * as rabbitmq from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a rabbitMQ app
 * @param name
 * @param options
 */
export async function creatApp(name: string, options?: IMidwayRabbitMQConfigurationOptions): Promise<IMidwayRabbitMQApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), Object.assign({
    imports: [rabbitmq]
  }, options));
}

export async function closeApp(app) {
  return close(app);
}
