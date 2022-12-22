import { Configuration, Inject } from '@midwayjs/core';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ]
})
export class ContainerConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  async onConfigLoad() {
    return {
      bull: {
        // 默认的队列配置
        defaultQueueOptions: {
          redis: {
            port: 6379,
            host: '127.0.0.1',
          },
          prefix: '{midway-task}',
        }
      },
    }
  }

  async onReady() {
  }
}
