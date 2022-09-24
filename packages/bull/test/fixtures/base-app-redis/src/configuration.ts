import { Configuration, Inject } from '@midwayjs/decorator';
import * as bull from '../../../../src';

@Configuration({
  imports: [
    bull
  ],
  importConfigs: [
    {
      default: {
        bull: {
          // 默认的队列配置
          defaultQueueOptions: {
            redis: {
              port: 6379,
              host: '127.0.0.1',
            },
            prefix: '{midway-task}',
          }
        }
      }
    }
  ]
})
export class ContainerConfiguration {

  @Inject()
  bullFramework: bull.Framework;

  async onReady() {
  }
}
