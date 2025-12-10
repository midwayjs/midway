import { MainApp } from '@midwayjs/core';
import { join } from 'path';
import { BackgroundTask, IBackgroundTask, Application } from '../../../../../src/';

@BackgroundTask({
  taskName: 'HelloBackgroundTask',
  worker: {
    filename: join(__dirname, '../../worker/hello.worker.js'),
    name: 'hello',
  },
})
export class HelloBackgroundTask implements IBackgroundTask {
  @MainApp()
  app: Application;

  async execute() {
    return 0;
  }

  async onComplete(result: number) {
    this.app.setAttr('bg_task', result);
  }
}
