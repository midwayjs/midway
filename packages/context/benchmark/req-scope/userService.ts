import {provide, scope, ScopeEnum} from '../../src/';

@provide()
@scope(ScopeEnum.Request)
export class UserService {

  async getUsers() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['harry', 'jiakun.du']);
      }, 100);
    });
  }
}
