'use strict';

import { provide } from 'injection';
import { schedule } from '@midwayjs/decorator';

@provide()
@schedule({
  type: 'worker',
  interval: 1000,
})
export default class IntervalCron {
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello decorator');
  }
}
