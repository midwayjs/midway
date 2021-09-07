import {
  WSController,
  OnWSMessage,
  Provide,
  OnWSConnection,
  Inject,
  WSEmit,
} from '@midwayjs/decorator';
import { SocketRequestEvent, SocketResponseEvent } from '../interface';
import { Context } from '@midwayjs/socketio';

@Provide()
@WSController('/')
export class HelloSocketController {
  @Inject()
  ctx: Context;

  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
  }

  @OnWSMessage(SocketRequestEvent.GREET)
  @WSEmit(SocketResponseEvent.GREET)
  async gotMessage(data1, data2, data3) {
    return {
      name: 'harry',
      result: data1 + data2 + data3,
    };
  }
}
