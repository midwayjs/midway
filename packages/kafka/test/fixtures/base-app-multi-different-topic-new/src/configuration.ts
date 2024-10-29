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
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
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
    console.info('gotData2 info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
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
                groupId: 'groupId-test',
              },
              subscribeOptions: {
                topics: ['topic-test'],
                fromBeginning: true
              }
            },
            sub2: {
              connectionOptions: {
                clientId: 'my-app',
                brokers: [process.env.KAFKA_URL || 'localhost:9092'],
              },
              consumerOptions: {
                groupId: 'groupId-test',
              },
              subscribeOptions: {
                topics: ['topic-test2'],
                fromBeginning: true
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
