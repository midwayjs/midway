import { Configuration } from '@midwayjs/core';
import * as bullmq from '../../../../src';

@Configuration({
  imports: [
    bullmq
  ],
  importConfigs: [
    {
      default: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
    },
  ],
})
export class ContainerConfiguration {

  async onReady() {

  }
}
