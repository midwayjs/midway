import {
  BaseFramework,
  ConsumerMetadata,
  Framework,
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
  MidwayFrameworkType,
  MSListenerType,
  MS_CONSUMER_KEY,
  MidwayInvokeForbiddenError,
  ILogger,
  Logger,
} from '@midwayjs/core';
import {
  IKafkaSubscriber,
  IMidwayConsumerConfig,
  IMidwayKafkaApplication,
  IMidwayKafkaContext,
} from './interface';
import { KafkaConsumerServer } from './kafka';
import { KAFKA_DECORATOR_KEY } from './decorator';
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaConfig,
  Consumer,
  logLevel,
} from 'kafkajs';

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

/**
 * 1、解决 sub 多实例的问题, 用类似 mqtt 的 sub 方案配置
 * 2、解决不能多个文件订阅的问题， 用 ref(‘xxx') 的方式
 * 3、考虑复用现有 kafka 实例的问题，提前创建好 kafka 实例，但是不做 connect
 * 4、consumer 上有方法，也要考虑怎么拿出来，加一个 @InjectConsumer('xxx') 的装饰器
 */
@Framework()
export class MidwayKafkaFramework extends BaseFramework<
  any,
  IMidwayKafkaContext,
  any
> {
  protected kafkaMap: Map<string, Kafka> = new Map();
  protected subscriberMap: Map<string, Consumer> = new Map();
  protected LogCreator: any;
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
      const { sub } = this.configurationOptions;
      const subscriberMap = {};
      // find subscriber
      const subscriberModules = listModule(KAFKA_DECORATOR_KEY);
      for (const subscriberModule of subscriberModules) {
        const subscriberName = getClassMetadata(
          KAFKA_DECORATOR_KEY,
          subscriberModule
        ) as string;
        subscriberMap[subscriberName] = subscriberModule;
      }

      for (const customKey in sub) {
        await this.createSubscriber(
          sub[customKey].connectionOptions,
          sub[customKey].consumerOptions,
          sub[customKey].subscribeOptions,
          sub[customKey].consumerRunConfig,
          subscriberMap[customKey],
          customKey,
          sub[customKey].instanceRef
        );
      }
    }
  }

  public async createSubscriber(
    connectionOptions: KafkaConfig,
    consumerOptions: ConsumerConfig,
    subscribeOptions: ConsumerSubscribeTopics | ConsumerSubscribeTopic,
    consumerRunConfig: ConsumerRunConfig,
    ClzProvider: new () => IKafkaSubscriber,
    clientName?: string,
    instanceRef?: string
  ) {
    let client;
    if (instanceRef) {
      client = this.kafkaMap.get(instanceRef);
    } else {
      client = new Kafka({
        ...connectionOptions,
        logCreator: this.LogCreator,
      });
    }

    const consumer = client.consumer(consumerOptions);
    await consumer.connect();
    await consumer.subscribe(subscribeOptions);

    this.kafkaMap.set(clientName, client);
    this.subscriberMap.set(clientName, consumer);

    const runMethod = ClzProvider.prototype['eachBatch']
      ? 'eachBatch'
      : 'eachMessage';

    const runConfig = {
      ...consumerRunConfig,
    };
    runConfig[runMethod] = async payload => {
      const ctx = this.app.createAnonymousContext();
      const fn = await this.applyMiddleware(async ctx => {
        ctx.payload = payload;
        const instance = await ctx.requestContext.getAsync(ClzProvider);
        return await instance[runMethod].call(instance, payload, ctx);
      });
      return await fn(ctx);
    };

    await consumer.run(runConfig);
  }

  private async loadLegacySubscriber() {
    const subscriberModules = listModule(MS_CONSUMER_KEY, module => {
      const metadata: ConsumerMetadata.ConsumerMetadata = getClassMetadata(
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
              eachMessage: async ({ topic, partition, message }) => {
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

  public getSubscriber(subscriberNameOrInstanceName: string) {
    return this.subscriberMap.get(subscriberNameOrInstanceName);
  }

  public getConnectionInstance(instanceName: string) {
    return this.kafkaMap.get(instanceName);
  }

  public getFrameworkName() {
    return 'midway:kafka';
  }

  protected async beforeStop(): Promise<void> {
    for (const consumer of this.subscriberMap.values()) {
      await consumer.disconnect();
    }
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_KAFKA;
  }
}
