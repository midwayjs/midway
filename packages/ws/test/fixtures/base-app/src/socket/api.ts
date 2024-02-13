import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
} from '@midwayjs/core';
import { UserService } from '../service/user';
import { IMidwayWSContext } from '../../../../../src';
import * as assert from 'assert';

@Provide()
@WSController()
export class APIController {
  @Inject()
  ctx: IMidwayWSContext;

  @Inject()
  userService: UserService;

  @OnWSConnection()
  init(socket, request) {
    console.log(`namespace / got a connection ${this.ctx.readyState}`);
    assert.ok(this.ctx.readyState === socket.readyState);
    assert.ok(request);
  }

  @OnWSMessage('message')
  async gotMyMessage(data) {
    return { name: 'harry', result: parseInt(data) + 5 };
  }

  @OnWSDisConnection()
  disconnect(id: number) {
    console.log('disconnect ' + id);
  }
}
