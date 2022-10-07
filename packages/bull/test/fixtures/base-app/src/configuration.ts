import { Configuration } from '@midwayjs/core';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ],
})
export class ContainerConfiguration {

  async onReady() {

  }
}
