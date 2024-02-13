import { Configuration, Inject } from '@midwayjs/core';
import * as cron from '../../../../src';
import { HelloTask } from './task/hello.task';
import { InjectJob, CronJob } from '../../../../src';
import * as assert from 'assert';

@Configuration({
  imports: [
    cron
  ],
})
export class ContainerConfiguration {
  @Inject()
  framework: cron.Framework;

  @InjectJob(HelloTask)
  helloTask: CronJob;

  async onServerReady() {
    console.log('in server ready ' + Date.now());
    this.framework.getJob(HelloTask).start();
    assert.ok(this.helloTask === this.framework.getJob(HelloTask));
  }
}
