import {
  Inject,
  OnWSMessage,
  WSController,
  WSEmit,
} from '@midwayjs/core';
import { Context } from '../../../../../src';

@WSController('/', { middleware: []})
export class APIController1 {
  @Inject()
  ctx: Context;

  @OnWSMessage('my')
  @WSEmit('ok')
  async gotMyMessage() {
    return {
      name: 'harry',
      result: this.ctx.getAttr('result'),
    };
  }
}
