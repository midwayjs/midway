import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayRabbitMQApplication } from '../../../../src';

@Configuration({
  importConfigs: [
    {
      default: {
        rabbitMQServer: {
          url: process.env.RABBITMQ_URL || 'amqp://localhost',
          reconnectTime: 2000
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwayRabbitMQApplication;

  async onReady() {
    this.app.setAttr('total', 0);
  }
}
