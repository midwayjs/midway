import {
  Configuration,
  IMidwayContainer,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import { StaticMiddleware } from './middleware/static.middleware';
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

  async onConfigLoad() {
    if (this.applicationManager.getApplication('faas')) {
      return {
        staticFile: {
          buffer: true,
        },
      };
    }
  }

  async onReady(container: IMidwayContainer) {
    this.applicationManager
      .getApplications(['koa', 'faas', 'egg'])
      .forEach(app => {
        if (container.hasNamespace('cross-domain')) {
          app.getMiddleware().insertAfter(StaticMiddleware, 'cors');
        } else {
          app.getMiddleware().insertFirst(StaticMiddleware);
        }
      });
  }
}
