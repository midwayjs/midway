import { controller, get, inject } from 'midway';
import { IUserAbstract, IUserResult } from '../../lib/interfaces/user.abstract';

type nextDefinition = () => void;

@controller('/user/')
export class UserController {
  @inject('userService')
  service: IUserAbstract;

  @get('/:id')
  async getUser(ctx: any, next: nextDefinition): Promise<void> {
    const id: number = ctx.request.params('id');
    const user: IUserResult = await this.service.getUser({id});
    ctx.body = {success: true, message: 'OK', data: user};
    // do not response again
    await next();
  }
}
