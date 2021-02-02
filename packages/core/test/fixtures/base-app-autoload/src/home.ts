import { Autoload, Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {

  idx = 0;

  @Init()
  async initService() {
    this.idx++;
  }

  async getUser() {
  }
}
