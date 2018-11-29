'use strict';

import { schedule } from '../../../../../../../midway';

@schedule({
  type: 'worker',
  interval: 1000,
})
export class IntervalCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}

@schedule({
  type: 'worker',
  interval: 1000,
})
export class NonDefCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello other functions');
  }
}
