import { Configuration } from '@midwayjs/core';
import * as bullmq from '../../../../src';

@Configuration({
  imports: [
    bullmq
  ],
})
export class ContainerConfiguration {

  async onReady() {

  }
}
