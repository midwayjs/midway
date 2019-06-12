import { Context, controller, get, inject, provide } from 'midway';
import { IUserService, IUserResult } from '../../interface';

@provide()
@controller('/user')
export class UserController {

  @inject()
  ctx: Context;

  @inject('userService')
  service: IUserService;

  @get('/:id')
  async getUser(): Promise<void> {
    const id: number = this.ctx.params.id;
    const user: IUserResult = await this.service.getUser({id});
    this.ctx.body = {success: true, message: 'OK', data: user};
  }
}
