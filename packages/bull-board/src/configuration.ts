import * as bull from '@midwayjs/bull';
import * as bullmq from '@midwayjs/bullmq';
import {
  Configuration,
  Inject,
  MidwayApplicationManager,
  MidwayConfigService,
} from '@midwayjs/core';
import { BoardMiddleware } from './board.middleware';
import { BullMQBoardMiddleware } from './bullmq.board.middleware';

@Configuration({
  namespace: 'bull-board',
  imports: [bull, bullmq],
  importConfigs: [
    {
      default: {
        bullBoard: {
          package: 'bull',
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

  async onReady() {
    const queuePackage =
      this.configService.getConfiguration('bullBoard.package');
    const apps = this.applicationManager.getApplications([
      'express',
      'egg',
      'koa',
    ]);
    if (apps.length) {
      apps.forEach(app => {
        if (queuePackage === 'bull') {
          app.useMiddleware(BoardMiddleware);
        } else if (queuePackage === 'bullmq') {
          app.useMiddleware(BullMQBoardMiddleware);
        }
      });
    }
  }
}
