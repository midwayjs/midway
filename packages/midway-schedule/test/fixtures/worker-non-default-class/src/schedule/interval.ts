'use strict';

import { Provide, Schedule } from '@midwayjs/decorator';

@Provide()
@Schedule({
  type: 'worker',
  interval: 1000,
})
export class IntervalCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}

@Provide()
@Schedule({
  type: 'worker',
  interval: 1000,
})
export class NonDefCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello other functions');
  }
}
