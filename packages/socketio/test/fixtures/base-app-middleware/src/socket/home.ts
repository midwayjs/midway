import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  WSController,
  WSEmit,
} from '@midwayjs/decorator';
import { Context } from '../../../../../src';

@WSController('/', { middleware: []})
export class APIController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  init() {
    console.log(`namespace ${this.ctx.nsp.name} / got a connection ${this.ctx.id}`);
  }

  @OnWSMessage('my')
  @WSEmit('ok')
  async gotMyMessage(data1, data2, data3) {
    return { name: 'harry', result: data1 + data2 + data3 };
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
