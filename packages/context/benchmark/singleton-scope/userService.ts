import {provide, scope, ScopeEnum} from '../../src/';

@provide()
@scope(ScopeEnum.Singleton)
export class UserService {

  async getUsers() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['harry', 'jiakun.du']);
      }, 100);
    });
  }
}
