import { BaseFramework } from '@midwayjs/core';
import {
  ConsumerMetadata,
  Framework,
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
  MidwayFrameworkType,
  MSListenerType,
  MS_CONSUMER_KEY,
} from '@midwayjs/decorator';
import { IMidwayKafkaApplication, IMidwayKafkaContext } from './interface';
import { KafkaConsumerServer } from './kafka';

@Framework()
export class MidwayKafkaFramework extends BaseFramework<any, any, any> {
  configure() {
    return this.configService.getConfiguration('kafka');
  }

  async applicationInitialize(options) {
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
      const topics = [...new Set(data.map(e => e[0].topic))];
      let tempTopics = [];
      topics.forEach(e => {
        tempTopics.push({ topic: e });
      });
      tempTopics = tempTopics.map(e => {
        let subscription = {};
        let runConfig = {};
        data.forEach(e2 => {
          if (e2[0].topic === e.topic) {
            if (
              typeof e2[0].subscription !== 'undefined' &&
              Object.keys(e2[0].subscription).length > 0
            ) {
              subscription = e2[0].subscription;
            }
            if (
              typeof e2[0].runConfig !== 'undefined' &&
              Object.keys(e2[0].runConfig).length > 0
            ) {
              runConfig = e2[0].runConfig;
            }
          }
        });
        e.subscription = subscription;
        e.runConfig = runConfig;
        return e;
      });
      tempTopics.forEach(async e => {
        await this.app.connection.subscribe(
          Object.assign(
            {
              topics: topics,
            },
            e.subscription
          )
        );
        await this.app.connection.run(
          Object.assign(e.runConfig, {
            eachMessage: async ({ topic, partition, message }) => {
              let propertyKey;
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
                    const ins = await ctx.requestContext.getAsync(module);
                    const fn = await this.applyMiddleware(async ctx => {
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
      });
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
