import {
  Configuration,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { I18nMiddleware } from './middleware';

@Configuration({
  namespace: 'i18n',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class I18nConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;
  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'egg', 'faas', 'express'])
      .forEach(app => {
        app.useMiddleware(I18nMiddleware);
      });
  }
}
