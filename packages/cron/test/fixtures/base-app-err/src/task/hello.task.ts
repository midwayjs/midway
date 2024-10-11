import { MainApp, Inject } from '@midwayjs/core';
import { Job, IJob, Context, Application } from '../../../../../src/';

@Job('HelloTask', {
  cronTime: '*/2 * * * * *',
  start: true,
  // runOnInit: true,
})
export class HelloTask implements IJob {
  @MainApp()
  app: Application;

  @Inject()
  ctx: Context;

  async onTick() {
    throw new Error('test error');
  }

  async onComplete() {
    console.log('task complete');
  }
}
