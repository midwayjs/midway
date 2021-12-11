import { Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { SessionMiddleware } from './middleware/session';
import { ClassMiddleware, MidwayApplicationManager } from '@midwayjs/core';

@Configuration({
  namespace: 'session',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class SessionConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager.getApplications(['express']).forEach(app => {
      app.useMiddleware(SessionMiddleware as ClassMiddleware<any, any, any>);
    });
  }
}
