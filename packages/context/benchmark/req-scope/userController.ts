import {UserService} from './userService';
import {scope, inject, provide, ScopeEnum} from '../../src/';

@provide()
@scope(ScopeEnum.Request)
export class UserController {

  @inject('ctx')
  ctx;

  @inject()
  userService: UserService;

  async index() {
    const { ctx } = this;
    ctx.body = await this.userService.getUsers();
    ctx.status = 200;
  }

}
