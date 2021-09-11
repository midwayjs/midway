import { Inject, Provide } from '@midwayjs/decorator';
import { B } from '.';

@Provide()
export class A {
  @Inject()
  b: B;
}
