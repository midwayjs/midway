import { Provide } from "@midwayjs/decorator";
import { RunInPrimary } from '../../../../../src';

@Provide()
export class TestService{

  @RunInPrimary()
  async hello(a, b){
    return a + b;
  }
}
