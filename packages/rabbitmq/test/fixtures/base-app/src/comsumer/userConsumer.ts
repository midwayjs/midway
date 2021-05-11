import { Provide, Consumer, MSListenerType, Inject, ConsumerQueuePattern } from '@midwayjs/decorator';
import { IMidwayRabbitMQContext } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @Inject()
  ctx: IMidwayRabbitMQContext;

  @Inject()
  logger;

  @ConsumerQueuePattern('tasks')
  async gotData(msg: ConsumeMessage) {
    this.logger.info('test output =>', msg.content.toString('utf8'));
    this.ctx.channel.ack(msg);
  }

}
