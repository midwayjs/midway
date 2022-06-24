import { Provide, Consumer, MSListenerType, KafkaListener, Inject } from '@midwayjs/decorator';
import { IMidwayKafkaContext } from '../../../../../src';
import {  KafkaMessage } from 'kafkajs';

@Provide()
@Consumer(MSListenerType.KAFKA)
export class UserConsumer {

  @Inject()
  ctx: IMidwayKafkaContext;

  @Inject()
  logger;

  @KafkaListener('topic-test')
  async gotData(message: KafkaMessage) {
    this.logger.info('test output =>', message.offset + ' ' + message.key + ' ' + message.value.toString('utf8'));
    this.ctx.commitOffsets(message.offset);
  }
}
