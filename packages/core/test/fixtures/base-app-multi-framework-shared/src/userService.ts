import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  id = Math.random();
}
