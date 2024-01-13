import { Configuration, ILifeCycle, sleep } from '../../../../src';

@Configuration({
})
export class AutoConfiguration implements ILifeCycle {
  async onReady(){}

  async onHealthCheck() {
    await sleep(100);
    return {
      status: true,
    };
  }
}
