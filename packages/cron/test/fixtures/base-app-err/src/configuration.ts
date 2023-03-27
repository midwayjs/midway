import { Configuration } from '@midwayjs/core';
import * as cron from '../../../../src';
@Configuration({
  imports: [
    cron
  ],
})
export class ContainerConfiguration {
  async onServerReady() {
    console.log('in server ready ' + Date.now());
  }
}
