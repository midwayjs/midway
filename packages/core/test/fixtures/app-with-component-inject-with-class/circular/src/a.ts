import { Inject, Provide } from '../../../../../src';
import { B } from '.';

@Provide()
export class A {
  @Inject()
  b: B;
}
