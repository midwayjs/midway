import { UserService } from './userService';
import { Scope, Inject, ScopeEnum } from '@midwayjs/decorator';

@Scope(ScopeEnum.Request)
export class UserController {
  @Inject('ctx')
  ctx;

  @Inject('newKey')
  dbApi;

  @Inject()
  userService: UserService;

  async index() {
    const { ctx } = this;
    ctx.body = await this.userService.getUsers();
    ctx.status = 200;
  }
}
