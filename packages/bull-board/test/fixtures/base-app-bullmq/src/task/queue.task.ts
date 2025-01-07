import { App, Inject } from '@midwayjs/core';
import { Processor, Application } from '@midwayjs/bullmq';

@Processor('test')
export class QueueTask {
  @App()
  app: Application;

  @Inject()
  logger;

  async execute(params) {
    this.logger.info(`====>QueueTask execute`);
    this.app.setAttr(`queueConfig`, JSON.stringify(params));
  }
}
