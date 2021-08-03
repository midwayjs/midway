import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';


@Configuration()
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
  }
}
