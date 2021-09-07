import { Provide } from "@midwayjs/decorator";
import { RunInPrimary } from '../../../../../src';

console.log("======")
console.log(RunInPrimary)
console.log("======")

@Provide()
export class TestService{

  @RunInPrimary()
  async hello(a, b){
    return a + b;
  }
}
