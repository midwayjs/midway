import { Provide, Schedule, CommonSchedule } from '@midwayjs/decorator';

@Provide()
@Schedule({
  type: 'worker',
  interval: 1000,
})
export default class IntervalCron implements CommonSchedule {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}
