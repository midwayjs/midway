import { Context, controller, provide, get, post, inject } from 'midway';
import { IUserService } from '../../lib/interface';

@provide()
@controller('/user')
export class UserController {

  @inject()
  ctx: Context;

  @inject('userService')
  service: IUserService;

  /**
   * GET /user/profile
   */
  @get('/profile')
  async profile() {
    const res = await this.service.profile();
    this.ctx.body = res.data;
  }

  /**
   * POST /user/login
   */
  @post('/login')
  async login() {
    const { username, password } = this.ctx.query;

    if (username === 'admin' && password === 'admin') {
      this.ctx.body = {
        status: 200,
        statusText: 'ok',
        currentAuthority: 'admin',
      };
    } else if (username === 'user' && password === 'user') {
      this.ctx.body = {
        status: 200,
        statusText: 'ok',
        currentAuthority: 'user',
      };
    } else {
      this.ctx.body = {
        status: 401,
        statusText: 'unauthorized',
        currentAuthority: 'guest',
      };
    }
  }

  /**
   * POST /user/register
   */
  @post('/register')
  async register() {
    this.ctx.body = {
      status: 200,
      statusText: 'ok',
      currentAuthority: 'user',
    };
  }

  /**
   * POST /user/logout
   */
  @post('/logout')
  async logout() {
    this.ctx.body = {
      status: 200,
      statusText: 'ok',
      currentAuthority: 'guest',
    };
  }
}
