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
@WSController('/test2')
export class API2Controller {
  @Inject()
  ctx: IMidwaySocketIOContext;

  @Inject()
  userService: UserService;

  @OnConnection()
  init() {
    console.log(`namespace / got a api2 connection ${this.ctx.id}`);
  }

  @OnMessage('my')
  @Emit('ok')
  async gotMyMessage(payload) {
    return { name: 'harry 2' };
  }

  @OnDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
