import { Configuration, Inject } from '@midwayjs/decorator';
import { StaticMiddleware } from './middleware/static.middleware';
import { MidwayApplicationManager } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';

@Configuration({
  namespace: 'info',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class StaticFileConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'egg'])
      .forEach(app => {
        app.getMiddleware().insertFirst(StaticMiddleware);
      });
  }
}
