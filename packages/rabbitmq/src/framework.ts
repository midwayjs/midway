import {
  ConsumerMetadata,
  MS_CONSUMER_KEY,
  MSListenerType,
  RabbitMQListenerOptions,
  Framework,
  BaseFramework,
  MidwayInvokeForbiddenError,
  DecoratorManager,
  MetadataManager,
  listPropertyDataFromClass,
  MidwayTraceService,
} from '@midwayjs/core';
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
  configure() {
    return this.configService.getConfiguration('rabbitmq');
  }

  async applicationInitialize(options) {
    const traceService = this.applicationContext.get(MidwayTraceService);
    // Create a connection manager
    this.app = new RabbitMQServer({
      logger: this.logger,
      traceService,
      ...this.configurationOptions,
    }) as unknown as IMidwayRabbitMQApplication;
  }

  public async run(): Promise<void> {
    try {
      // init connection
      await this.app.connect(
        this.configurationOptions.url,
        this.configurationOptions.socketOptions
      );
      await this.loadSubscriber();
      this.logger.info('Rabbitmq server start success');
    } catch (error) {
      this.app.close();
      throw error;
    }
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  private async loadSubscriber() {
    // create channel
    const subscriberModules = DecoratorManager.listModule(
      MS_CONSUMER_KEY,
      module => {
        const metadata: ConsumerMetadata.ConsumerMetadata =
          MetadataManager.getOwnMetadata(MS_CONSUMER_KEY, module);
        return metadata.type === MSListenerType.RABBITMQ;
      }
    );
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
                data,
                channel,
                queueName: listenerOptions.queueName,
                ack: data => {
                  return channelWrapper.ack(data);
                },
              } as IMidwayRabbitMQContext;
              const traceService =
                this.applicationContext.get(MidwayTraceService);
              const traceMetaResolver =
                this.configurationOptions?.tracing?.meta;
              const headers = data?.properties?.headers ?? {};
              await traceService.runWithEntrySpan(
                `rabbitmq ${listenerOptions.queueName}`,
                {
                  carrier: headers,
                  attributes: {
                    'midway.protocol': 'rabbitmq',
                    'midway.rabbitmq.queue': listenerOptions.queueName,
                  },
                  meta: traceMetaResolver,
                  metaArgs: {
                    ctx,
                    carrier: headers,
                    request: data,
                    custom: {
                      queueName: listenerOptions.queueName,
                    },
                  },
                },
                async () => {
                  this.app.createAnonymousContext(ctx);
                  const isPassed = await this.app
                    .getFramework()
                    .runGuard(ctx, module, listenerOptions.propertyKey);
                  if (!isPassed) {
                    throw new MidwayInvokeForbiddenError(
                      listenerOptions.propertyKey,
                      module
                    );
                  }
                  const ins = await ctx.requestContext.getAsync(module);
                  const fn = await this.applyMiddleware(async ctx => {
                    return await ins[listenerOptions.propertyKey].call(
                      ins,
                      data
                    );
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
          );
        }
      }
    }
  }

  public getFrameworkName() {
    return 'rabbitmq';
  }
}
