import { Configuration, App, Config } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@Configuration({
  importConfigs: ['./config.default'],
})
export class FaaSContainerConfiguration implements ILifeCycle {
  @App()
  app;

  @Config('middleware')
  middleware;

  async onReady(container: IMidwayContainer) {
    for (const mw of this.middleware) {
      this.app.use(mw);
    }
  }
}
