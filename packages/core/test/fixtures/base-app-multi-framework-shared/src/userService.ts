import { Provide, Scope, ScopeEnum } from '../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  id = Math.random();
}
