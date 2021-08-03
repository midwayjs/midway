import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject } from '@midwayjs/decorator';
import { IMidwayRabbitMQContext } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @Inject()
  ctx: IMidwayRabbitMQContext;

  @Inject()
  logger;

  @RabbitMQListener('non-exist')
  async gotData(msg: ConsumeMessage) {
    this.logger.info('test output =>', msg.content.toString('utf8'));
  }

}
