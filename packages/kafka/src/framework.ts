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
} from '@midwayjs/core';
import {
  IMidwayConsumerConfig,
  IMidwayKafkaApplication,
  IMidwayKafkaContext,
} from './interface';
import { KafkaConsumerServer } from './kafka';

@Framework()
export class MidwayKafkaFramework extends BaseFramework<any, any, any> {
  configure() {
    return this.configService.getConfiguration('kafka');
  }

  async applicationInitialize() {
    // Create a connection manager
    this.app = new KafkaConsumerServer({
      logger: this.logger,
      ...this.configurationOptions,
    }) as unknown as IMidwayKafkaApplication;
  }

  public async run(): Promise<void> {
    try {
      await this.app.connect(
        this.configurationOptions.kafkaConfig,
        this.configurationOptions.consumerConfig
      );
      await this.loadSubscriber();
      this.logger.info('Kafka consumer server start success');
    } catch (error) {
      this.logger.error('Kafka consumer connect fail', error);
      await this.app.closeConnection();
    }
  }

  private async loadSubscriber() {
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
                          const res = await this.app.connection.commitOffsets(
                            message.offset
                          );
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

  public getFrameworkName() {
    return 'midway:kafka';
  }

  protected async beforeStop(): Promise<void> {
    await this.app.close();
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.MS_KAFKA;
  }
}
