import { Configuration, Inject, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { IKafkaSubscriber, Context, Application, KafkaSubscriber } from '../../../../src';
import { EachMessagePayload } from 'kafkajs';

@KafkaSubscriber('sub1')
export class UserConsumer implements IKafkaSubscriber {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  async eachMessage(payload: EachMessagePayload) {
    const message = payload.message;
    this.logger.info('test 1 output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}

@KafkaSubscriber('sub2')
export class UserConsumer2 implements IKafkaSubscriber {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  async eachMessage(payload: EachMessagePayload) {
    const message = payload.message;
    this.logger.info('test 2 output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}

@Configuration({
  importConfigs: [
    {
      default: {
        kafka: {
          sub: {
            sub1: {
              connectionOptions: {
                clientId: 'my-app',
                brokers: [process.env.KAFKA_URL || 'localhost:9092'],
              },
              consumerOptions: {
                groupId: 'groupId-test-1',
              },
              subscribeOptions: {
                topics: ['topic-test-1'],
                fromBeginning: false,
              }
            },
            sub2: {
              instanceRef: 'sub1',
              consumerOptions: {
                groupId: 'groupId-test-2',
              },
              subscribeOptions: {
                topics: ['topic-test-2'],
                fromBeginning: false,
              }
            }
          }
        },
      },
    },
  ],
})
export class AutoConfiguration implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    this.app.setAttr('total', 0);
  }
}
