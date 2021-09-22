import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
  App
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { Context, Application } from '../../../../../src';

@Provide()
@WSController('/')
export class APIController {
  @Inject()
  ctx: Context;

  @App()
  app: Application;

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
    console.log(this.app.sockets.adapter.rooms);
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
