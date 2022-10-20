import { App, FORMAT, Provide, Task } from '@midwayjs/core';
import { Application } from "@midwayjs/koa";
import { TaskLocal } from '@midwayjs/core';

@Provide()
export class HelloTask {

  @App()
  app: Application;

  @TaskLocal('*/2 * * * * *')
  async hello() {
    this.app.getApplicationContext().registerObject(`name`, 'taskLocal');
  }

  @Task({
    repeat: { cron: FORMAT.CRONTAB.EVERY_PER_5_SECOND },
  })
  async task(){
    this.app.getApplicationContext().registerObject(`task`, 'task');
  }
}
