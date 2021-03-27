import {
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
export class APIController {
  @Inject()
  ctx: IMidwaySocketIOContext;

  @Inject()
  userService: UserService;

  @OnConnection()
  init() {
    console.log(`namespace / got a connection ${this.ctx.id}`);
  }

  @OnMessage('my')
  async gotMyMessage(data1, data2, data3) {
    return { name: 'harry', result: data1 + data2 + data3 };
  }

  @OnDisConnection()
  disconnect(reason: string) {
    console.log(this.ctx.id + ' disconnect ' + reason);
  }
}
