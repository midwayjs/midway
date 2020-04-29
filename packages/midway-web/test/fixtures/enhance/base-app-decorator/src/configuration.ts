import { configuration, logger, app } from '../../../../../src';
import { ILifeCycle, IMidwayContainer, IMidwayCoreApplication } from '@midwayjs/core';

@configuration({})
export class LifeCycleTest implements ILifeCycle {
  @logger()
  logger: any;

  @app()
  appx: IMidwayCoreApplication;

  async onReady(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle test1');
    this.logger.debug('this is a lifecycle test1');

    if (this.appx) {
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
