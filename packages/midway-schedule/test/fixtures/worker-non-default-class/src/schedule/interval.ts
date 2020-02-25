import { schedule } from '@midwayjs/decorator';

import { provide } from 'injection';


@provide()
@schedule({
  type: 'worker',
  interval: 1000,
})
export class IntervalCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}

@provide()
@schedule({
  type: 'worker',
  interval: 1000,
})
export class NonDefCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello other functions');
  }
}
