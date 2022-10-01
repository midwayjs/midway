import { Configuration, Inject } from '@midwayjs/decorator';
import * as bull from '@midwayjs/bull';
import { MidwayApplicationManager, MidwayConfigService } from '@midwayjs/core';
import { BoardMiddleware } from './board.middleware';

@Configuration({
  namespace: 'bull-board',
  imports: [bull],
  importConfigs: [
    {
      default: {
        bullBoard: {
          basePath: '/ui',
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

  async onReady() {
    const apps = this.applicationManager.getApplications([
      'express',
      'egg',
      'koa',
    ]);
    if (apps.length) {
      apps.forEach(app => {
        app.useMiddleware(BoardMiddleware);
      });
    }
  }
}
