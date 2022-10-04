import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
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
  async gotMyMessage(data1, data2, data3) {
    return { name: 'harry', result: data1 + data2 + data3 };
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
