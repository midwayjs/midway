import { Configuration, Inject } from '@midwayjs/decorator';
import { InfoMiddleware } from './middleware/info.middleware';
import { MidwayApplicationManager } from '@midwayjs/core';
import * as DefaultConfig from './config.default';

@Configuration({
  namespace: 'info',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class InfoConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(InfoMiddleware);
      });
  }
}
