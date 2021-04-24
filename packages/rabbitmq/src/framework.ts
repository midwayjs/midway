import {
  BaseFramework,
  getClassMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  listPropertyDataFromClass,
  MidwayFrameworkType,
} from '@midwayjs/core';

import {
  MS_CONSUMER_KEY,
  MSListenerType,
  RabbitMQListenerOptions,
} from '@midwayjs/decorator';
import {
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQConfigurationOptions,
  IMidwayRabbitMQContext,
} from './interface';
import { RabbitMQServer } from './mq';
import { ConsumeMessage } from 'amqplib';

export class MidwayRabbitMQFramework extends BaseFramework<
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQContext,
  IMidwayRabbitMQConfigurationOptions
> {
  public app: IMidwayRabbitMQApplication;
  public consumerList = [];

  async applicationInitialize(options) {
    this.app = (new RabbitMQServer(
      logger: this.logger,
      ...this.configurationOptions,
    ) as unknown) as IMidwayRabbitMQApplication;
    // init connection
    await this.app.init();
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadSubscriber();
  }

  public async run(): Promise<void> {
    await Promise.all(this.consumerList);
    this.logger.info('Rabbitmq server start success');
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_RABBITMQ;
  }

  private async loadSubscriber() {
    // create room
    const subscriberModules = listModule(MS_CONSUMER_KEY, module => {
      const type: MSListenerType = getClassMetadata(MS_CONSUMER_KEY, module);
      return type === MSListenerType.RABBITMQ;
    });
    for (const module of subscriberModules) {
      // get providerId
      const providerId = getProviderId(module);
      // get listenerInfo
      const data: RabbitMQListenerOptions[][] = listPropertyDataFromClass(
        MS_CONSUMER_KEY,
        module
      );

      for (const methodBindListeners of data) {
        for (const listenerOptions of methodBindListeners) {
          this.consumerList.push(
            this.bindConsumerToRequestMethod(listenerOptions, providerId)
          );
        }
      }
    }
  }

  bindConsumerToRequestMethod(listenerOptions, providerId) {
    return this.app.createConsumer(
      listenerOptions,
      async (data?: ConsumeMessage) => {
        const ctx = {
          channel: this.app.getChannel(),
          queueName: listenerOptions.queueName,
        } as IMidwayRabbitMQContext;
        this.app.createAnonymousContext(ctx);
        const ins = await ctx.requestContext.getAsync(providerId);
        await ins[listenerOptions.propertyKey].call(ins, data);
      }
    );
  }

  public getFrameworkName() {
    return 'midway:rabbitmq';
  }
}
