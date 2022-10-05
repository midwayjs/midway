import {
  Configuration,
  Inject,
  ClassMiddleware,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { SessionMiddleware } from './middleware/session';

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
