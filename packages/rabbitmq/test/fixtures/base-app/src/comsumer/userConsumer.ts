import { Provide, Consumer, MSListenerType, RabbitMQListener, Inject } from '@midwayjs/decorator';
import { IMidwayRabbitMQContext } from '../../../../../src';
import { ConsumeMessage } from 'amqplib';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class UserConsumer {

  @Inject()
  ctx: IMidwayRabbitMQContext;

  @RabbitMQListener('tasks')
  async gotData(msg: ConsumeMessage) {
    this.ctx.channel.ack(msg);
  }

}
