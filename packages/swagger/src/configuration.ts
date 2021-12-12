import {
  ILifeCycle,
  IMidwayContainer,
  MidwayApplicationManager,
} from '@midwayjs/core';
import { Inject, Configuration } from '@midwayjs/decorator';
import { SwaggerExplorer, SwaggerMiddleware } from '.';
import * as DefaultConfig from './config/config.default';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
  namespace: 'swagger',
})
export class SwaggerConfiguration implements ILifeCycle {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady(container: IMidwayContainer) {
    this.applicationManager
      .getApplications(['express', 'koa', 'egg', 'faas'])
      .forEach(app => {
        app.useMiddleware(SwaggerMiddleware);
      });

    const explorer = await container.getAsync(SwaggerExplorer);
    explorer.scanApp();
  }
}
