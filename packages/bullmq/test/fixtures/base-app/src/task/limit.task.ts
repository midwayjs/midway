import { App, sleep, Inject } from '@midwayjs/core';
import { Processor, Application } from '../../../../../src';

@Processor('concurrency', {}, { limiter: { max: 3, duration: 1000 }, concurrency: 3 }, {})
export class QueueTask {
  @App()
  app: Application;

  @Inject()
  logger;

  async execute(params) {
    await sleep(3 * 1000);
  }
}
