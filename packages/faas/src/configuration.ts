import { Configuration, App, Config } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';

@Configuration({
  importConfigs: ['./config.default'],
})
export class FaaSContainerConfiguration implements ILifeCycle {
  @App()
  app: {
    globalMiddleware: string[];
  };

  @Config('middleware')
  middleware: string[];

  async onReady() {
    // add middleware from user config
    for (const mw of this.middleware) {
      this.app.globalMiddleware.push(mw);
    }
  }
}
