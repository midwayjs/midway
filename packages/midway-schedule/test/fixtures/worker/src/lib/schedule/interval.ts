'use strict';

import { schedule } from '../../../../../../../midway';

@schedule({
  type: 'worker',
  interval: 1000,
})
export default class IntervalCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}
