import { App, Configuration } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from 'egg';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
  }
}
