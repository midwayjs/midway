import { FORMAT, App, Inject, IMidwayApplication } from '@midwayjs/core';
import { Processor, IProcessor } from '../../../../../src';

@Processor('HelloTask', {
  repeat: {
    pattern: FORMAT.CRONTAB.EVERY_PER_5_SECOND
  }
})
export class HelloTask implements IProcessor {
  @App()
  app: IMidwayApplication;

  @Inject()
  logger;

  async execute() {
    this.app.setAttr(`task`, 'task');
  }
}
