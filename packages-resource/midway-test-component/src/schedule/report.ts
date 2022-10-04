// src/schedule/hello.ts
import { Schedule, Inject, CommonSchedule } from '@midwayjs/core';

@Schedule({
  interval: 2333, // 2.333s 间隔
  type: 'worker', // 指定某一个 worker 执行
})
export class HelloCron implements CommonSchedule {
  @Inject()
  ctx: any;

  // 定时执行的具体任务
  async exec() {
    this.ctx.logger.info(process.pid, 'report from schedule');
  }
}
