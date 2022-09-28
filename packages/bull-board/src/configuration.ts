import { Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import * as bull from '@midwayjs/bull';
import { MidwayApplicationManager } from '@midwayjs/core';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { KoaAdapter } from '@bull-board/koa';

@Configuration({
  namespace: 'bull-board',
  imports: [bull],
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BullBoardConfiguration {
  @Inject()
  framework: bull.Framework;

  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    const queueList = this.framework.getQueueList();
    const wrapQueues = queueList.map(queue => new BullAdapter(queue));

    const expressApp = this.applicationManager.getApplication('express');
    if (expressApp) {
      const serverAdapter = new ExpressAdapter();

      createBullBoard({
        queues: wrapQueues,
        serverAdapter,
      });

      serverAdapter.setBasePath('/admin/queues');
      expressApp['use']('/admin/queues', serverAdapter.getRouter());
    }

    const apps = this.applicationManager.getApplications(['egg', 'koa']);
    for (const app of apps) {
      const serverAdapter = new KoaAdapter();

      createBullBoard({
        queues: wrapQueues,
        serverAdapter,
      });

      serverAdapter.setBasePath('/ui');
      await app['use'](serverAdapter.registerPlugin());
    }
  }
}
