import {
  Inject,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
  WSEmit,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayWSContext } from '../../../../../src';

@Provide()
@WSController()
export class APIController {
  @Inject()
  ctx: IMidwayWSContext;

  @Inject()
  userService: UserService;

  @OnWSConnection()
  init() {
    console.log(`namespace / got a connection ${this.ctx.id}`);
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
