import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
  WSEmit,
} from '@midwayjs/core';
import { UserService } from '../service/user';
import { Context } from '../../../../../src';

@Provide()
@WSController('/')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @OnWSConnection()
  init() {
    console.log(`namespace / got a connection ${this.ctx.id}`);
  }

  @OnWSMessage('my')
  @WSEmit('ok')
  async gotMyMessage(payload) {
    return { name: 'harry' };
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
