import { App, Inject, sleep } from '@midwayjs/core';
import { Processor, Application } from '../../../../../src';

@Processor('limit',2,{},{limiter: { max: 3, duration: 1000 }})
export class QueueTask1 {
  @App()
  app: Application;

  @Inject()
  logger;

  async execute(params) {
    await sleep(3*1000)
  }
}
