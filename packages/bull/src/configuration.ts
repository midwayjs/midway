import { Configuration, Init, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { BullFramework } from './framework';
import { MidwayDecoratorService } from '@midwayjs/core';
import { BULL_QUEUE_KEY } from './constants';

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

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      BULL_QUEUE_KEY,
      (
        propertyName,
        meta: {
          queueName: string;
        }
      ) => {
        return this.framework.getQueue(meta.queueName);
      }
    );
  }
}
