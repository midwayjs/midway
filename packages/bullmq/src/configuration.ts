import {
  Configuration,
  Init,
  Inject,
  MidwayDecoratorService,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import { BullMQFramework } from './framework';
import {
  BULLMQ_FLOW_PRODUCER_KEY,
  BULLMQ_QUEUE_KEY,
  BULLMQ_WORKER_KEY,
} from './constants';

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

    this.decoratorService.registerPropertyHandler(
      BULLMQ_WORKER_KEY,
      (
        propertyName,
        meta: {
          queueName: string;
        }
      ) => {
        return this.framework.getWorker(meta.queueName);
      }
    );

    this.decoratorService.registerPropertyHandler(
      BULLMQ_FLOW_PRODUCER_KEY,
      (
        propertyName,
        meta: {
          producerName: string;
        }
      ) => {
        return this.framework.getFlowProducer(meta.producerName);
      }
    );
  }

  async onReady() {
    this.framework.loadConfig();
  }
}
