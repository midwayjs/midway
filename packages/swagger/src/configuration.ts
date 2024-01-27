import {
  Configuration,
  ILifeCycle,
  Inject,
  IMidwayContainer,
  MidwayApplicationManager,
  MidwayConfigService,
  MidwayWebRouterService,
} from '@midwayjs/core';
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

  @Inject()
  readonly webRouterService: MidwayWebRouterService;

  async onServerReady(container: IMidwayContainer) {
    const apps = this.applicationManager.getApplications([
      'express',
      'koa',
      'egg',
      'faas',
    ]);

    if (apps.length) {
      const explorer = await container.getAsync(SwaggerExplorer);
      const routerTable = await this.webRouterService.getRouterTable();
      explorer.scanApp(routerTable);

      // 添加统一前缀
      let globalPrefix =
        this.configService.getConfiguration('globalPrefix') ||
        this.configService.getConfiguration('koa.globalPrefix') ||
        this.configService.getConfiguration('express.globalPrefix') ||
        this.configService.getConfiguration('egg.globalPrefix');

      if (globalPrefix) {
        if (!/^\//.test(globalPrefix)) {
          globalPrefix = '/' + globalPrefix;
        }

        explorer.addGlobalPrefix(globalPrefix);
      }

      apps.forEach(app => {
        app.useMiddleware(SwaggerMiddleware);
      });
    }
  }
}
