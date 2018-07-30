import {controller, provide, get} from 'midway';
import {UserService} from '../../lib/userService';

@provide()
@controller('/')
export class HomeController {

  user: UserService;

  @get('/')
  async index(ctx) {
    ctx.body = `hi, ${this.user.getUser()}, my name is midway`;
  }
}
