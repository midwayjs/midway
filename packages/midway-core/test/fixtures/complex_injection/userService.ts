import { ScopeEnum } from '../../../src';
import { Scope } from '@midwayjs/decorator';

@Scope(ScopeEnum.Request)
export class UserService {
  async getUsers() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['harry', 'jiakun.du']);
      }, 100);
    });
  }
}
