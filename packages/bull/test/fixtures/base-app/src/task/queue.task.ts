import { App, Inject } from "@midwayjs/decorator";
import { Processor, Application } from '../../../../../src';

@Processor('test')
export class QueueTask {

  @App()
  app: Application;

  @Inject()
  logger;

  async execute(params){
    this.logger.info(`====>QueueTask execute`)
    this.app.getApplicationContext().registerObject(`queueConfig`, JSON.stringify(params));
  }
}
