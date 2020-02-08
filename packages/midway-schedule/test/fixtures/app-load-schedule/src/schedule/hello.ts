import { Provide, Schedule } from '@midwayjs/decorator';

@Provide()
@Schedule({
  type: 'worker',
  interval: 2333,
})
export default class HelloCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello');
  }
}
