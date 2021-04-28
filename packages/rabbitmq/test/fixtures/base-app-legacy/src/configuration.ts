import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwayRabbitMQApplication } from '../../../../src';

@Configuration({
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwayRabbitMQApplication;

  async onReady() {
  }
}
