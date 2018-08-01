import { provide } from 'midway';
import { IUserAbstract, IUserOptions, IUserResult } from '../../lib/User';

@provide('userService')
export class UserService implements IUserAbstract {

  async getUser(options: IUserOptions): Promise<IUserResult> {
    return {
      id: options.id,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    };
  }
}
