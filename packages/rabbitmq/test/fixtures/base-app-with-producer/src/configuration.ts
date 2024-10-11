import { Configuration, MainApp } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayRabbitMQApplication } from '../../../../src';
import * as rabbitmq from '../../../../src/index';

@Configuration({
  imports: [rabbitmq]
})
export class AutoConfiguration implements ILifeCycle {

  @MainApp()
  app: IMidwayRabbitMQApplication;

  async onReady() {
  }
}
