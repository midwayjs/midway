import { FORMAT, MainApp, Inject } from '@midwayjs/core';
import { IMidwayApplication } from '@midwayjs/core';
import { IProcessor, Processor } from '../../../../../src';

@Processor('HelloTask', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_SECOND
  }
})
export class HelloTask implements IProcessor {
  @MainApp()
  app: IMidwayApplication;

  @Inject()
  abc: any

  async execute() {
    this.app.setAttr(`task`, 'task');
  }
}
