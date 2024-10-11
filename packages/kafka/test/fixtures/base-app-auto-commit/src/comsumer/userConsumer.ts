import { Provide, Consumer, MSListenerType, Inject, MainApp, KafkaListener } from '@midwayjs/core';
import { KafkaMessage } from 'kafkajs';
import { Context, Application } from '../../../../../src';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @MainApp()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  @KafkaListener('topic-test', {
    subscription: {
      fromBeginning: false,
    },
    runConfig: {
      autoCommit: true,
    }
  })
  async gotData(message: KafkaMessage) {
    console.info('gotData info');
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.app.setAttr('total', this.app.getAttr<number>('total') + 1);
  }
}
