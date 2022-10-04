import { Configuration, sleep } from '@midwayjs/core';

@Configuration({
})
export class AutoConfiguration {
  async onReady() {
    await sleep(3000);
  }
}
