import { App, FORMAT, Provide, Task } from '@midwayjs/decorator';
import { Application } from "@midwayjs/koa";

@Provide()
export class HelloTask {

  @App()
  app: Application;

  @Task({
    repeat: { cron: FORMAT.CRONTAB.EVERY_PER_5_SECOND },
  })
  async task(){
    this.app.getApplicationContext().registerObject(`task`, 'task');
  }
}
