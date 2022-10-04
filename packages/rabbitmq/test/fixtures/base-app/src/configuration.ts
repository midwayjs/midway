import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayRabbitMQApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        rabbitmq: { url: process.env.RABBITMQ_URL || 'amqp://localhost'}
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwayRabbitMQApplication;

  async onReady() {
  }
}
