import { Configuration } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import * as mqtt from '../../../../src';

@Configuration({
  imports: [mqtt],
  importConfigs: []
})
export class AutoConfiguration implements ILifeCycle {
  async onReady() {
    console.log('onReady');
  }
}
