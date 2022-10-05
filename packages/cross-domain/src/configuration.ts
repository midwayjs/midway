import {
  Configuration,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
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
