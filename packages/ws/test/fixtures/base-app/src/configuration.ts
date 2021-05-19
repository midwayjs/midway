import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IMidwaySocketIOApplication } from '../../../../src';


@Configuration()
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: IMidwaySocketIOApplication;

  async onReady() {
  }
}
