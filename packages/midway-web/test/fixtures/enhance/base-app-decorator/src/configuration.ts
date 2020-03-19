import { configuration, logger } from '../../../../../src';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@configuration({})
export class LifeCycleTest implements ILifeCycle {
  @logger()
  logger: any;
  async onReady(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle test1');
    this.logger.debug('this is a lifecycle test1');
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle on stop test1');
    this.logger.debug('this is a lifecycle test1 stop');
  }
}
