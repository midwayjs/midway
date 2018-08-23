import {inject, provide} from 'injection';
import {UserService} from './userService';

@provide()
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
