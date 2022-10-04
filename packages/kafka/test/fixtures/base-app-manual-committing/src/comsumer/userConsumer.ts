import { Provide, Consumer, MSListenerType, Inject, App, KafkaListener } from '@midwayjs/core';
import { KafkaMessage } from 'kafkajs';
import { Context, Application } from '../../../../../src';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @KafkaListener('topic-test0', {
    subscription: {
      fromBeginning: false,
    },
    runConfig: {
      autoCommit: false,
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    try {
      // 抛出异常，当出现异常的时候，需要设置commitOffsets偏移到异常的位置，用于重新执行消费，所以这里应该出现的消费是2次，total为2
      throw new Error("error");
    } catch (error) {
      this.ctx.commitOffsets(message.offset);
    }
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}
