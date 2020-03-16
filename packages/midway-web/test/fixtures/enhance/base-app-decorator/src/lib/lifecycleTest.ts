import {lifeCycle} from '../../../../../../src';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';

@lifeCycle()
export class LifeCycleTest implements ILifeCycle {
  async onReady(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle test1');
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    console.log('this is lifecycle on stop test1');
  }
}
