import { Logger } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer, IMidwayApplication } from '@midwayjs/core';
import { Configuration, App } from '@midwayjs/decorator';

@Configuration({
  imports: [
    require('midway-plugin-mod'),
    require('@midwayjs/midway-plugin-atmod'),
    require('@midwayjs/midway-plugin-btmod'),
    require('@midwayjs/midway-plugin-btmod'),
  ]
})
export class LifeCycleTest implements ILifeCycle {
  @Logger()
  logger: any;

  @App()
  appx: IMidwayApplication;

  async onReady(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle test1');
    this.logger.debug('this is a lifecycle test1');

    if (!this.appx) {
      throw new Error('app is empty!');
    }
    if (!this.appx.getAppDir()) {
      throw new Error('app.baseDir is empty!');
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle on stop test1');
    this.logger.debug('this is a lifecycle test1 stop');
  }
}
