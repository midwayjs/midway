import { Inject, Provide } from '../../../../../src';
import { A } from './a';

@Provide()
export class B {
  @Inject()
  a: A;
}
