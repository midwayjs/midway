import { Provide, Schedule, CommonSchedule } from '@midwayjs/decorator';

@Provide()
@Schedule({
  type: 'worker',
  interval: 500,
})
export default class IntervalCron2 implements CommonSchedule {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator2');
  }
}
