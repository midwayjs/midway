import { controller, get, inject, Controller } from '../../../../../../packages/midway';
import { IUserService, IUserResult } from '../../interface';

@controller('/user/')
export class UserController extends Controller {
  @inject('userService')
  service: IUserService;

  @get('/:id')
  async getUser(): Promise<void> {
    const id: number = this.ctx.request.params('id');
    const user: IUserResult = await this.service.getUser({id});
    this.ctx.body = {success: true, message: 'OK', data: user};
  }
}
