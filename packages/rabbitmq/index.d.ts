import { IMidwayRabbitMQConfigurationOptions } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    rabbitmq?: PowerPartial<IMidwayRabbitMQConfigurationOptions>;
  }
}
