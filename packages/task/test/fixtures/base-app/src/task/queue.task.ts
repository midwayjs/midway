import { App, Inject, Provide, Queue } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";

@Queue()
@Provide()
export class QueueTask{

  @App()
  app: Application;

  @Inject()
  ctx;

  async execute(params){
    this.ctx.logger.info(`====>QueueTask execute`)
    this.app.getApplicationContext().registerObject(`queueConfig`, JSON.stringify(params));
  }
}
