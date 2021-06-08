import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject, App } from '@midwayjs/decorator';
import { Context, Application } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @RabbitMQListener('abc', {
    exchange: 'logs',
    exchangeOptions: {
      type: 'fanout',
      durable: false,
    },
    exclusive: true,
    consumeOptions: {
      noAck: true,
    }
  })
  async gotData(msg: ConsumeMessage) {
    // Wait for Queue Messages
    this.logger.info('test output1 =>', msg.content.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

  @RabbitMQListener('bcd', {
    exchange: 'logs',
    exchangeOptions: {
      type: 'fanout',
      durable: false,
    },
    exclusive: true,
    consumeOptions: {
      noAck: true,
    }
  })
  async gotData2(msg: ConsumeMessage) {
    // Wait for Queue Messages
    this.logger.info('test output2 =>', msg.content.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }

}
