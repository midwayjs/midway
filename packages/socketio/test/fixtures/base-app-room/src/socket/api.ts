import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
} from '@midwayjs/decorator';
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

  @OnWSMessage('joinRoom')
  async joinRoom(roomId) {
    console.log(this.ctx.id + ' join ' + roomId);
    this.ctx.join(roomId);
    this.ctx.join('defaultRoom');
  }

  @OnWSMessage('leaveRoom')
  async leaveRoom(roomId) {
    this.ctx.leave(roomId);
    this.ctx.leave('defaultRoom');
  }

  @OnWSMessage('broadcast')
  async gotMyMessage(roomId) {
    if (roomId === 'room1') {
      this.ctx.app.to(roomId).emit('broadcastResult', { msg: roomId + ' got message' });
    } else {
      this.ctx.to(roomId).emit('broadcastResult', { msg: roomId + ' got message' });
    }
  }

  @OnWSDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
