import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IFaaSApplication } from './interface';

@Configuration({
  importConfigs: ['./config.default'],
})
export class FaaSContainerConfiguration implements ILifeCycle {
  @App()
  app: IFaaSApplication;

  async onReady() {}
}
