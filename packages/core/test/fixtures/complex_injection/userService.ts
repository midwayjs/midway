import { Scope, ScopeEnum } from '../../../src';

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
