import {
  Configuration,
  Init,
  Inject,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { BullMQFramework } from './framework';
import { BULLMQ_QUEUE_KEY } from './constants';

@Configuration({
  namespace: 'bullmq',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BullConfiguration {
  @Inject()
  framework: BullMQFramework;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Init()
  async init() {
    this.decoratorService.registerPropertyHandler(
      BULLMQ_QUEUE_KEY,
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

  async onReady() {
    this.framework.loadConfig();
  }
}
