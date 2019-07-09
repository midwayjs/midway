import { provide } from 'midway'

import { GetUserOpts, UserInfo } from './user.model'


@provide()
export class UserService {

  /**
   * 读取用户信息
   */
  public async getUser(options: GetUserOpts): Promise<UserInfo> {
    return {
      id: options.id,
      user_name: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    }
  }

}
