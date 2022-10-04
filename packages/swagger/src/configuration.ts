import {
  ILifeCycle,
  IMidwayContainer,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import { Inject, Configuration } from '@midwayjs/core';
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

  @Inject()
  configService: MidwayConfigService;

  async onReady(container: IMidwayContainer) {
    const apps = this.applicationManager.getApplications([
      'express',
      'koa',
      'egg',
      'faas',
    ]);

    if (apps.length) {
      const globalPrefix =
        this.configService.getConfiguration('globalPrefix') ||
        this.configService.getConfiguration('koa.globalPrefix') ||
        this.configService.getConfiguration('express.globalPrefix') ||
        this.configService.getConfiguration('egg.globalPrefix');
      const explorer = await container.getAsync(SwaggerExplorer);
      explorer.addGlobalPrefix(globalPrefix);
      explorer.scanApp();

      apps.forEach(app => {
        app.useMiddleware(SwaggerMiddleware);
      });
    }
  }
}
