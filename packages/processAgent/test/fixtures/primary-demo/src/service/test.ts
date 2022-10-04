import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { RunInPrimary } from '../../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService{

  @RunInPrimary()
  async hello(a, b){
    return a + b;
  }
}
