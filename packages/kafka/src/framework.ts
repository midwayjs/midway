import { BaseFramework } from '@midwayjs/core';
import {
  ConsumerMetadata,
  Framework,
  getClassMetadata,
  listModule,
  listPropertyDataFromClass,
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
    this.app = new KafkaConsumerServer() as unknown as IMidwayKafkaApplication;
  }

  public async run(): Promise<void> {
    await this.app.connect(
      this.configurationOptions.kafkaConfig,
      this.configurationOptions.consumerConfig
    );
    await this.loadSubscriber();
    this.logger.info('Kafka consumer server start success');
  }

  private async loadSubscriber() {
    //     await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
    // await consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     console.log({
    //       value: message.value.toString(),
    //     })
    //   },
    // })
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
          await this.app.subscribe({
            topic: listenerOptions,
            fromBeginning: true,
          });
        }
      }
    }

    await this.app.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          value: message.value.toString(),
        });
        const ctx = {
          topic: topic,
          partition: partition,
          message: message,
        } as IMidwayKafkaContext;
        const ins = await ctx.requestContext.getAsync(module);
        const fn = await this.applyMiddleware(async ctx => {
          return await ins['test'];
        });
        try {
          const result = await fn(ctx);
          if (result) {
            return message;
          }
        } catch (error) {
          this.logger.error(error);
        }
      },
    });
  }

  public getFrameworkName() {
    return 'midway:kafka';
  }
}
