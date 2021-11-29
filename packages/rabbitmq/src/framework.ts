import {
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
  MidwayFrameworkType,
  ConsumerMetadata,
  MS_CONSUMER_KEY,
  MSListenerType,
  RabbitMQListenerOptions,
  Framework,
} from '@midwayjs/decorator';
import { BaseFramework } from '@midwayjs/core';
import {
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQConfigurationOptions,
  IMidwayRabbitMQContext,
} from './interface';
import { RabbitMQServer } from './mq';
import { ConsumeMessage } from 'amqplib';

@Framework()
export class MidwayRabbitMQFramework extends BaseFramework<
  IMidwayRabbitMQApplication,
  IMidwayRabbitMQContext,
  IMidwayRabbitMQConfigurationOptions
> {
  public app: IMidwayRabbitMQApplication;
  public consumerHandlerList = [];

  configure() {
    return this.configService.getConfiguration('rabbitMQServer');
  }

  async applicationInitialize(options) {
    // Create a connection manager
    this.app = new RabbitMQServer({
      logger: this.logger,
      ...this.configurationOptions,
    }) as unknown as IMidwayRabbitMQApplication;
  }

  public async run(): Promise<void> {
    // init connection
    await this.app.connect(
      this.configurationOptions.url,
      this.configurationOptions.socketOptions
    );
    await this.loadSubscriber();
    this.logger.info('Rabbitmq server start success');
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_RABBITMQ;
  }

  private async loadSubscriber() {
    // create channel
    const subscriberModules = listModule(MS_CONSUMER_KEY, module => {
      const metadata: ConsumerMetadata.ConsumerMetadata = getClassMetadata(
        MS_CONSUMER_KEY,
        module
      );
      return metadata.type === MSListenerType.RABBITMQ;
    });
    for (const module of subscriberModules) {
      const data: RabbitMQListenerOptions[][] = listPropertyDataFromClass(
        MS_CONSUMER_KEY,
        module
      );

      for (const methodBindListeners of data) {
        // 循环绑定的方法和监听的配置信息
        for (const listenerOptions of methodBindListeners) {
          await this.app.createConsumer(
            listenerOptions,
            async (data: ConsumeMessage, channel, channelWrapper) => {
              const ctx = {
                channel,
                queueName: listenerOptions.queueName,
                ack: data => {
                  return channelWrapper.ack(data);
                },
              } as IMidwayRabbitMQContext;
              this.app.createAnonymousContext(ctx);
              const ins = await ctx.requestContext.getAsync(module);
              const fn = await this.getMiddleware(async ctx => {
                return await ins[listenerOptions.propertyKey].call(ins, data);
              });

              try {
                const result = await fn(ctx);
                if (result) {
                  return channelWrapper.ack(data);
                }
              } catch (error) {
                this.logger.error(error);
              }
            }
          );
        }
      }
    }
  }

  public getFrameworkName() {
    return 'midway:rabbitmq';
  }
}
