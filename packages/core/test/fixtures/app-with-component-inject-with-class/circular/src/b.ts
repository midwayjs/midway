import { LazyInject, Provide } from '../../../../../src';
import { A } from './a';

@Provide()
export class B {
  @LazyInject(() => A)
  a: A;
}
