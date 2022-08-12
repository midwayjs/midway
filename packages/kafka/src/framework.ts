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
      for (const methodBindListeners of data) {
        for (const listenerOptions of methodBindListeners) {
          await this.app.connection.subscribe({
            topic: listenerOptions.topic,
            // fromBeginning: true,
          });
          await this.app.connection.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message }) => {
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
              } as IMidwayKafkaContext;
              this.app.createAnonymousContext(ctx);
              const ins = await ctx.requestContext.getAsync(module);
              const fn = await this.applyMiddleware(async ctx => {
                return await ins[listenerOptions.propertyKey].call(
                  ins,
                  message
                );
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
                this.logger.error(error);
              }
            },
          });
        }
      }
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
