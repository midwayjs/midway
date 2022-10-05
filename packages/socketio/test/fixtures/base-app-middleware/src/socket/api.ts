import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  WSController,
  WSEmit,
} from '@midwayjs/core';
import { Context } from '../../../../../src';
import {
  ControllerMiddleware,
  NamespaceConnectionMiddleware,
  NamespacePacketMiddleware, NamespacePacketMiddleware2
} from '../middleware/conn.middleware';

@WSController('/api', { middleware: [ControllerMiddleware]})
export class APIController {
  @Inject()
  ctx: Context;

  @OnWSConnection({
    middleware: [NamespaceConnectionMiddleware]
  })
  init() {
    console.log(`namespace ${this.ctx.nsp.name} / got a connection ${this.ctx.id}`);
  }

  @OnWSMessage('my', {
    middleware: [NamespacePacketMiddleware]
  })
  @WSEmit('ok')
  async gotMyMessage(data1, data2, data3) {
    return {
      name: 'harry111',
      result: this.ctx.getAttr('result'),
    };
  }

  @OnWSMessage('my1', {
    middleware: [NamespacePacketMiddleware2]
  })
  @WSEmit('ok1')
  async gotMyMessage1(data1, data2, data3) {
    return {
      name: 'harry222',
      result: this.ctx.getAttr('result'),
    };
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
