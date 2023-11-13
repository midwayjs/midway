import { Configuration, sleep } from '../../../../src';

@Configuration({
})
export class AutoConfiguration {
  async onReady(){}

  async onHealthCheck() {
    await sleep(100);
    return '';
  }
}
