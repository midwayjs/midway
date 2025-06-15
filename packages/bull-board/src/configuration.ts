import {
  Configuration,
  IMidwayContainer,
  Inject,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import { BoardMiddleware } from './board.middleware';
import { BullBoardManager } from './board.manager';

@Configuration({
  namespace: 'bull-board',
  importConfigs: [
    {
      default: {
        bullBoard: {
          basePath: '/ui',
          uiConfig: {},
          adapterOptions: {
            readOnlyMode: false,
          },
        },
      },
    },
  ],
})
export class BullBoardConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Inject()
  configService: MidwayConfigService;

  async onReady(container: IMidwayContainer) {
    const apps = this.applicationManager.getApplications([
      'express',
      'egg',
      'koa',
    ]);
    if (apps.length) {
      apps.forEach(app => {
        if (
          container.hasNamespace('bull') ||
          container.hasNamespace('bullmq')
        ) {
          app.useMiddleware(BoardMiddleware);
        }
      });
    }
  }

  async onServerReady(container: IMidwayContainer) {
    await container.getAsync(BullBoardManager);
  }
}
