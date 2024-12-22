import {
  BaseFramework,
  Framework,
  MetadataManager,
  DecoratorManager,
  TypedResourceManager,
  MidwayCommonError,
} from '@midwayjs/core';
import {
  IKafkaConsumerInitOptions,
  IKafkaConsumer,
  IMidwayKafkaContext,
} from './interface';
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
  protected frameworkLoggerName = 'kafkaLogger';

  configure() {
    return this.configService.getConfiguration('kafka');
  }

  async applicationInitialize() {
    this.LogCreator = logLevel => {
      const logger = this.logger;

      return ({ level, log }) => {
        const lvl = toMidwayLogLevel(level);
        const { message, ...extra } = log;
        logger?.[lvl](message, extra);
      };
    };

    this.app = {} as any;
  }

  public async run(): Promise<void> {
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
