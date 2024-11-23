import {
  Configuration,
  Inject,
  MidwayApplicationManager,
} from '@midwayjs/core';
import { NextJSMiddleware } from './middleware';

@Configuration({
  namespace: 'nextjs',
  importConfigs: [
    {
      unittest: {
        next: {
          dev: false,
        }
      }
    }
  ]
})
export class NextJSConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(NextJSMiddleware);
      });
  }
}
