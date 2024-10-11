import { FORMAT, MainApp} from '@midwayjs/core';
import { IMidwayApplication } from '@midwayjs/core';
import { IProcessor, Processor } from '../../../../../src';

@Processor('HelloTask', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_PER_5_SECOND
  }
})
export class HelloTask implements IProcessor {
  @MainApp()
  app: IMidwayApplication;

  async execute() {
    this.app.setAttr(`task`, 'task');
  }
}
