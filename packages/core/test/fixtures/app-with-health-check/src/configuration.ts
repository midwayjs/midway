import { ApplicationContext, Configuration, ILifeCycle, IMidwayContainer, sleep } from '../../../../src';
import { ok } from 'assert';

@Configuration({
})
export class AutoConfiguration implements ILifeCycle {
  @ApplicationContext()
  applicationContext: IMidwayContainer;
  async onReady(){}

  async onHealthCheck() {
    ok(this.applicationContext);
    await sleep(100);
    return {
      status: true,
    };
  }
}
