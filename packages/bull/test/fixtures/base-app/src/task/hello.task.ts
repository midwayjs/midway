import { App, FORMAT, Provide, Task } from '@midwayjs/decorator';

@Task()
export class HelloTask {

  @Task({
    repeat: { cron: FORMAT.CRONTAB.EVERY_PER_5_SECOND },
  })
  async task(){
    this.app.getApplicationContext().registerObject(`task`, 'task');
  }
}
