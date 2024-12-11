import { Init, Provide, Scope, ScopeEnum } from '../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService2 {

  idx = 0;

  @Init()
  async initService() {
    this.idx++;
  }

  async getUser() {
  }
}
