import { controller, Controller, get, inject, provide } from 'midway';
import { IUserResult, IUserService } from '../../interface';

@provide()
@controller('/user')
export class UserController extends Controller {
  @inject('userService')
  service: IUserService;

  @get('/:id')
  async getUser(): Promise<void> {
    const id: number = this.ctx.params.id;
    const user: IUserResult = await this.service.getUser({id});
    this.ctx.body = {success: true, message: 'OK', data: user};
  }
}
