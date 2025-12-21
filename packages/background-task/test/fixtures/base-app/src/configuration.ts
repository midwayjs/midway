import { CommonJSFileDetector, Configuration, Inject } from '@midwayjs/core';
import { join } from 'path';
import * as bg from '../../../../src';

@Configuration({
  imports: [bg],
  detector: new CommonJSFileDetector(),
})
export class ContainerConfiguration {
  @Inject()
  framework: bg.Framework;

  async onReady() {
    // 测试 Promise 模式
    await this.framework.runInBackground(
      async (payload: { value: number }) => {
        return payload.value + 1;
      },
      {
        payload: { value: 10 },
        taskName: 'promiseTask',
        onComplete: (result) => {
          // @ts-ignore
          this.framework.getApplication().setAttr('promiseResult', result);
        },
      }
    );

    // 测试 Thread 模式
    await this.framework.runInWorkerThread(
      join(__dirname, '../worker/compute.worker'),
      {
        handler: 'compute',
        payload: { value: 20 },
        taskName: 'threadTask',
        onComplete: (result) => {
          // @ts-ignore
          this.framework.getApplication().setAttr('threadResult', result);
        },
      }
    );
  }
}
