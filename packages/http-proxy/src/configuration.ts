import {
  Config,
  Configuration,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
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

  @Config('httpProxy')
  httpProxy;

  async onReady() {
    if (this.httpProxy) {
      this.applicationManager
        .getApplications(['koa', 'faas', 'express', 'egg'])
        .forEach(app => {
          app.useMiddleware(HttpProxyMiddleware);
        });
    }
  }
}
