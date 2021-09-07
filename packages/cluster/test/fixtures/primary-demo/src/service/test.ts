import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { RunInPrimary } from '../../../../../src';

@Provide()
@Scope(ScopeEnum.Singleton)
export class TestService{

  @RunInPrimary()
  async hello(a, b){
    return a + b;
  }
}
