import { App, Provide } from "@midwayjs/decorator";
import { Application } from "@midwayjs/koa";
import { TaskLocal } from "../../../../../src";

@Provide()
export class HelloTask{

  @App()
  app: Application;

  @TaskLocal('*/5 * * * * *')
  async hello(){
    this.app.getApplicationContext().registerObject(`name`, 'taskLocal');
  }
}