import { Inject, Provide } from '@midwayjs/decorator';
import { A } from './a';

@Provide()
export class B {
  @Inject()
  a: A;
}
