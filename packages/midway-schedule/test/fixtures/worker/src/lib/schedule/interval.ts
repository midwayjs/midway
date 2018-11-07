'use strict';

import { schedule } from '../../../../../../../midway/dist';
// import * as fs from 'fs';

@schedule({
  type: 'worker',
  interval: 200,
})
export default class IntervalCron {
  async exec(ctx) {
    throw new Error('hahaha');
    // console.log(1234);
    // ctx.logger.info('interval');
    // ctx.app.coreLogger.info('hello world');
    // fs.writeFileSync(
    //   require('path').join(__dirname, '../../logs/worker/hello.log'),
    //   'hello world',
    // );
  }
}
