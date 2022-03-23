import { Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { MidwayApplicationManager } from '@midwayjs/core';
import { HttpProxyMiddleware } from './middleware';
@Configuration({
  namespace: 'upload',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class HttpProxyConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(HttpProxyMiddleware);
      });
  }
}
