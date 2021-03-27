import {
  Inject,
  OnConnection,
  OnDisConnection,
  OnMessage,
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

  @OnConnection()
  init() {
    console.log(`namespace / got a connection ${this.ctx.id}`);
  }

  @OnMessage('joinRoom')
  async joinRoom(roomId) {
    console.log(this.ctx.id + ' join ' + roomId);
    this.ctx.join(roomId);
    this.ctx.join('defaultRoom');
  }

  @OnMessage('leaveRoom')
  async leaveRoom(roomId) {
    this.ctx.leave(roomId);
    this.ctx.leave('defaultRoom');
  }

  @OnMessage('broadcast')
  async gotMyMessage(roomId) {
    if (roomId === 'room1') {
      this.ctx.app.to(roomId).emit('broadcastResult', { msg: roomId + ' got message' });
    } else {
      this.ctx.to(roomId).emit('broadcastResult', { msg: roomId + ' got message' });
    }
  }

  @OnDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
