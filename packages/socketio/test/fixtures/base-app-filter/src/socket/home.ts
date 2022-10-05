import {
  Inject,
  OnWSMessage,
  WSController,
  WSEmit,
} from '@midwayjs/core';
import { Context } from '../../../../../src';

@WSController('/', { middleware: []})
export class APIController {
  @Inject()
  ctx: Context;

  @OnWSMessage('my')
  @WSEmit('ok')
  async gotMyMessage() {
    throw new Error('custom error');
  }
}
