import {
  BaseFramework,
  ConsumerMetadata,
  Framework,
  MSListenerType,
  MS_CONSUMER_KEY,
  MidwayInvokeForbiddenError,
  MetadataManager,
  DecoratorManager,
  listPropertyDataFromClass,
  ILogger,
  Logger,
  TypedResourceManager,
  MidwayCommonError,
} from '@midwayjs/core';
import {
  IKafkaConsumerInitOptions,
  IKafkaConsumer,
  IMidwayConsumerConfig,
  IMidwayKafkaApplication,
  IMidwayKafkaContext,
} from './interface';
import { KafkaConsumerServer } from './kafka';
import { KAFKA_DECORATOR_KEY } from './decorator';
import { ConsumerRunConfig, Kafka, Consumer, logLevel } from 'kafkajs';
import { KafkaManager } from './manager';

const toMidwayLogLevel = level => {
  switch (level) {
    case logLevel.NOTHING:
      return 'none';
    case logLevel.ERROR:
      return 'error';
    case logLevel.WARN:
      return 'warn';
    case logLevel.INFO:
      return 'info';
    case logLevel.DEBUG:
      return 'debug';
  }
};

@Framework()
export class MidwayKafkaFramework extends BaseFramework<
  any,
  IMidwayKafkaContext,
  any
> {
  protected LogCreator: any;
  protected typedResourceManager: TypedResourceManager<
    Consumer,
    IKafkaConsumerInitOptions,
    IKafkaConsumer
  >;
  configure() {
    return this.configService.getConfiguration('kafka');
  }

  @Logger('kafkaLogger')
  kafKaLogger: ILogger;

  async applicationInitialize() {
    this.LogCreator = logLevel => {
      const logger = this.kafKaLogger;

      return ({ level, log }) => {
        const lvl = toMidwayLogLevel(level);
        const { message, ...extra } = log;
        logger?.[lvl](message, extra);
      };
    };

    // Create a connection manager
    if (this.configurationOptions['kafkaConfig']) {
      this.app = new KafkaConsumerServer({
        logger: this.kafKaLogger,
        ...this.configurationOptions,
      }) as unknown as IMidwayKafkaApplication;
    } else {
      this.app = {} as any;
    }
  }

  public async run(): Promise<void> {
    if (this.configurationOptions['kafkaConfig']) {
      try {
        await this.app.connect(
          this.configurationOptions.kafkaConfig,
          this.configurationOptions.consumerConfig
        );
        await this.loadLegacySubscriber();
        this.kafKaLogger.info('Kafka consumer server start success');
      } catch (error) {
        this.kafKaLogger.error('Kafka consumer connect fail', error);
        await this.app.closeConnection();
      }
    } else {
      const { consumer } = this.configurationOptions;
      if (!consumer) return;
      const subscriberMap = {};
      // find subscriber
      const subscriberModules = DecoratorManager.listModule(KAFKA_DECORATOR_KEY);
      for (const subscriberModule of subscriberModules) {
        const subscriberName = MetadataManager.getOwnMetadata(
          KAFKA_DECORATOR_KEY,
          subscriberModule
        ) as string;
        subscriberMap[subscriberName] = subscriberModule;
      }

      this.typedResourceManager = new TypedResourceManager<
        Consumer,
        IKafkaConsumerInitOptions,
        IKafkaConsumer
      >({
        initializeValue: consumer,
        initializeClzProvider: subscriberMap,
        resourceInitialize: async (resourceInitializeConfig, resourceName) => {
          let client;
          if (resourceInitializeConfig.kafkaInstanceRef) {
            client = KafkaManager.getInstance().getKafkaInstance(
              resourceInitializeConfig.kafkaInstanceRef
            );
            if (!client) {
              throw new MidwayCommonError(
                `kafka instance ${resourceInitializeConfig.kafkaInstanceRef} not found`
              );
            }
          } else {
            client = new Kafka({
              logCreator: this.LogCreator,
              ...resourceInitializeConfig.connectionOptions,
            });
            KafkaManager.getInstance().addKafkaInstance(resourceName, client);
          }

          const consumer = client.consumer(
            resourceInitializeConfig.consumerOptions
          );
          await consumer.connect();
          await consumer.subscribe(resourceInitializeConfig.subscribeOptions);
          return consumer;
        },
        resourceBinding: async (
          ClzProvider,
          resourceInitializeConfig,
          consumer
        ): Promise<ConsumerRunConfig> => {
          const runMethod = ClzProvider.prototype['eachBatch']
            ? 'eachBatch'
            : 'eachMessage';
          const runConfig = {
            ...resourceInitializeConfig.consumerRunConfig,
          };
          runConfig[runMethod] = async payload => {
            const ctx = this.app.createAnonymousContext();
            const fn = await this.applyMiddleware(async ctx => {
              ctx.payload = payload;
              ctx.consumer = consumer;
              const instance = await ctx.requestContext.getAsync(ClzProvider);
              return await instance[runMethod].call(instance, payload, ctx);
            });
            return await fn(ctx);
          };
          return runConfig;
        },
        resourceStart: async (
          resource: Consumer,
          resourceInitializeConfig,
          resourceBindingResult: ConsumerRunConfig
        ) => {
          await resource.run(resourceBindingResult);
        },
        resourceDestroy: async (resource: Consumer) => {
          await resource.disconnect();
        },
      });
      await this.typedResourceManager.init();
      await this.typedResourceManager.start();
    }
  }

  private async loadLegacySubscriber() {
    const subscriberModules = DecoratorManager.listModule(MS_CONSUMER_KEY, module => {
      const metadata: ConsumerMetadata.ConsumerMetadata = MetadataManager.getOwnMetadata(
        MS_CONSUMER_KEY,
        module
      );
      return metadata.type === MSListenerType.KAFKA;
    });
    for (const module of subscriberModules) {
      const data = listPropertyDataFromClass(MS_CONSUMER_KEY, module);
      const topicTitles = [...new Set(data.map(e => e[0].topic))];
      const midwayConsumerConfigs: IMidwayConsumerConfig[] = topicTitles.map(
        e => {
          const midwayConsumerConfig: IMidwayConsumerConfig = {
            topic: e,
            subscription: {},
            runConfig: {},
          };

          const consumerParams = data
            .map(value => {
              if (value[0].topic === midwayConsumerConfig.topic) {
                return Object.assign(midwayConsumerConfig, value[0]);
              }
            })
            .filter(e => e && true);

          if (consumerParams && Object.keys(consumerParams[0]).length > 0) {
            return consumerParams[0];
          }
          return midwayConsumerConfig;
        }
      );
      midwayConsumerConfigs.forEach(
        async (e: { subscription: any; runConfig: any }) => {
          await this.app.connection.subscribe(
            Object.assign(
              {
                topics: topicTitles,
              },
              e.subscription
            )
          );
          await this.app.connection.run(
            Object.assign(e.runConfig, {
              eachMessage: async payload => {
                const { topic, partition, message } = payload;
                let propertyKey: string | number;
                for (const methodBindListeners of data) {
                  for (const listenerOptions of methodBindListeners) {
                    if (topic === listenerOptions.topic) {
                      propertyKey = listenerOptions.propertyKey;
                      const ctx = {
                        topic: topic,
                        partition: partition,
                        message: message,
                        commitOffsets: (offset: any) => {
                          return this.app.connection.commitOffsets([
                            {
                              topic: topic,
                              partition: partition,
                              offset,
                            },
                          ]);
                        },
                        payload,
                        consumer: this.app.connection,
                      } as unknown as IMidwayKafkaContext;
                      this.app.createAnonymousContext(ctx);

                      if (typeof propertyKey === 'string') {
                        const isPassed = await this.app
                          .getFramework()
                          .runGuard(ctx, module, propertyKey);
                        if (!isPassed) {
                          throw new MidwayInvokeForbiddenError(
                            propertyKey,
                            module
                          );
                        }
                      }
                      const ins = await ctx.requestContext.getAsync(module);
                      const fn = await this.applyMiddleware(async () => {
                        return await ins[propertyKey].call(ins, message);
                      });
                      try {
                        const result = await fn(ctx);
                        // 返回为undefined，下面永远不会执行
                        if (result) {
                          const res = await this.app.connection.commitOffsets([
                            {
                              topic: topic,
                              partition: partition,
                              offset: message.offset,
                            },
                          ]);
                          return res;
                        }
                      } catch (error) {
                        // 记录偏移量提交的异常情况
                        this.logger.error(error);
                      }
                    }
                  }
                }
              },
            })
          );
        }
      );
    }
  }

  public getConsumer(subscriberNameOrInstanceName: string) {
    if (this.typedResourceManager) {
      return this.typedResourceManager.getResource(
        subscriberNameOrInstanceName
      );
    }
  }

  public getKafka(instanceName: string) {
    return KafkaManager.getInstance().getKafkaInstance(instanceName);
  }

  public getFrameworkName() {
    return 'kafka';
  }

  protected async beforeStop(): Promise<void> {
    if (this.typedResourceManager) {
      await this.typedResourceManager.destroy();
    }
  }
}
