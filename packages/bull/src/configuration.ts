import { Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { BullFramework } from './framework';
import { IMidwayContainer } from '@midwayjs/core';

@Configuration({
  namespace: 'task',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BullConfiguration {
  @Inject()
  framework: BullFramework;

  async onReady(container: IMidwayContainer) {
    // TODO
  }
}
