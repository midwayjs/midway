import { App, Provide, Task } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";
import { TaskLocal } from "@midwayjs/decorator";

@Provide()
export class HelloTask{

  @App()
  app: Application;

  @TaskLocal('*/2 * * * * *')
  async hello(){
    this.app.getApplicationContext().registerObject(`name`, 'taskLocal');
  }

  @Task({
    repeat: { cron: '*/3 * * * * *'}
  })
  async task(){
    this.app.getApplicationContext().registerObject(`task`, 'task');
  }
}
