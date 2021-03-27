import {
  Emit,
  Inject,
  OnConnection,
  OnDisConnection,
  OnMessage,
  Provide,
  WSController,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwaySocketIOContext } from '../../../../../src';

@Provide()
@WSController('/')
export class HomeController {
  @Inject()
  ctx: IMidwaySocketIOContext;

  @Inject()
  userService: UserService;

  @OnConnection()
  init() {
    console.log(`namespace / got a home connection ${this.ctx.id}`);
  }

  @OnMessage('my')
  @Emit('ok')
  async gotMyMessage(payload) {
    return { name: 'harry home' };
  }

  @OnDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
