import {UserService} from './userService';
import {scope, inject, provide, ScopeEnum} from '../../src/';

@provide()
@scope(ScopeEnum.Singleton)
export class UserController {

  @inject()
  userService: UserService;

  async index() {
    let ctx = {body: null, status: 200};
    ctx.body = await this.userService.getUsers();
    ctx.status = 200;
  }

}
