import { configuration, logger, app } from '../../../../../src';
import { ILifeCycle, IMidwayContainer, IMidwayCoreApplication } from '@midwayjs/core';

@configuration({
  imports: [
    'midway-plugin-mod',
    '@midwayjs/midway-plugin-atmod',
    '@midwayjs/midway-plugin-btmod',
    '@midwayjs/midway-plugin-btmod'
  ]
})
export class LifeCycleTest implements ILifeCycle {
  @logger()
  logger: any;

  @app()
  appx: IMidwayCoreApplication;

  async onReady(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle test1');
    this.logger.debug('this is a lifecycle test1');

    if (!this.appx) {
      throw new Error('app is empty!');
    }
    if (!this.appx.baseDir) {
      throw new Error('app.baseDir is empty!');
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle on stop test1');
    this.logger.debug('this is a lifecycle test1 stop');
  }
}
