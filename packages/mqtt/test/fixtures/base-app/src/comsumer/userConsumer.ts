import { Inject } from '@midwayjs/core';
import { Context, IMqttSubscriber, MqttSubscriber } from '../../../../../src';
import * as assert from 'node:assert';

@MqttSubscriber('test')
export class UserConsumer implements IMqttSubscriber {

  @Inject()
  ctx: Context;

  @Inject()
  logger;

  async subscribe(ctx: Context) {
    this.logger.info('subscribe once');
    assert(this.ctx === ctx);
    assert(ctx.packet.cmd === 'publish');
    assert(ctx.packet.payload === ctx.message);
  }
}
