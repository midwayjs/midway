import { Configuration, App, Config } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { IFaaSApplication } from './interface';

@Configuration({
  importConfigs: ['./config.default'],
})
export class FaaSContainerConfiguration implements ILifeCycle {
  @App()
  app: IFaaSApplication;

  @Config('middleware')
  middleware: string[];

  async onReady() {
    // add middleware from user config
    if (this.app?.use && this.middleware?.length) {
      await this.app.useMiddleware(this.middleware);
    }
  }
}
