import {
  Configuration,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import { InfoMiddleware } from './middleware/info.middleware';
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
