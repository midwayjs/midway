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

  @RabbitMQListener('', {
    exchange: 'direct_logs',
    exchangeOptions: {
      type: 'direct',
      durable: false,
    },
    routingKey: 'direct_key',
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

  @RabbitMQListener('', {
    exchange: 'direct_logs',
    exchangeOptions: {
      type: 'direct',
      durable: false,
    },
    routingKey: 'abc',
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
