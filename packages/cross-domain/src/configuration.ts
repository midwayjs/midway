import { Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { MidwayApplicationManager } from '@midwayjs/core';
import { CorsMiddleware } from './middleware/cors';
@Configuration({
  namespace: 'cross-domain',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class CrossDomainConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(CorsMiddleware);
      });
  }
}
