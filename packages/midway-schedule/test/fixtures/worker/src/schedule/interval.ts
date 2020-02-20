import { provide } from 'injection'
import { schedule, CommonSchedule } from '@midwayjs/decorator'

@provide()
@schedule({
  type: 'worker',
  interval: 1000,
})
export default class IntervalCron implements CommonSchedule {

  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator')
  }

}
