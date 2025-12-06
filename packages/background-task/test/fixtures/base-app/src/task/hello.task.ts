import { MainApp } from '@midwayjs/core';
import { BackgroundTask, IBackgroundTask, Application } from '../../../../../src/';
let idx = 0;

@BackgroundTask('HelloBackgroundTask')
export class HelloBackgroundTask implements IBackgroundTask {
  @MainApp()
  app: Application;

  async execute() {
    idx++;
    this.app.setAttr('bg_task', idx);
    return idx;
  }

  async onComplete() {}
}
