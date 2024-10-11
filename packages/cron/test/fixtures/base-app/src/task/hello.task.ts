import { MainApp, Inject, sleep } from '@midwayjs/core';
import { Job, IJob, Context, Application } from '../../../../../src/';
let idx = 0;

@Job('HelloTask', {
  cronTime: '*/2 * * * * *',
  // start: true,
  // runOnInit: true,
})
export class HelloTask implements IJob {
  @MainApp()
  app: Application;

  @Inject()
  ctx: Context;

  async onTick() {
    idx++;
    console.log('task', idx);
    this.app.setAttr(`task`, idx);

    if (idx === 1) {
      this.ctx.job.stop();
    }

    await sleep(2000);

    console.log('task end');
  }

  async onComplete() {
    console.log('task complete');
  }
}
