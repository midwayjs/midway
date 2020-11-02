import { Configuration, sleep } from '@midwayjs/decorator';

@Configuration({
})
export class AutoConfiguration {
  async onReady() {
    await sleep(3000);
  }
}
