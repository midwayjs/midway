import { App, Inject } from '@midwayjs/core';
import { IMidwayApplication } from '@midwayjs/core';
import { Job, IJob, Context } from '../../../../../src/';
let idx = 0;

@Job('HelloTask', {
  cronTime: '*/2 * * * * *',
  // start: true,
  // runOnInit: true,
})
export class HelloTask implements IJob {
  @App()
  app: IMidwayApplication;

  @Inject()
  ctx: Context;

  async onTick() {
    idx++;
    console.log('task', idx);
    this.app.setAttr(`task`, idx);

    if (idx === 1) {
      this.ctx.job.stop();
    }
  }
}
