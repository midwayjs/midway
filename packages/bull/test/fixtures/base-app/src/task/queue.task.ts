import { MainApp, Inject } from '@midwayjs/core';
import { Processor, Application } from '../../../../../src';

@Processor('test')
export class QueueTask {
  @MainApp()
  app: Application;

  @Inject()
  logger;

  async execute(params) {
    this.logger.info(`====>QueueTask execute`);
    this.app.setAttr(`queueConfig`, JSON.stringify(params));
  }
}
