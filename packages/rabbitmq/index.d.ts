import type { PowerPartial } from '@midwayjs/core';
import { IMidwayRabbitMQConfigurationOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    rabbitmq?: PowerPartial<IMidwayRabbitMQConfigurationOptions>;
  }
}
