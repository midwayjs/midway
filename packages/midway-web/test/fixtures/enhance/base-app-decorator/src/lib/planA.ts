import { inject, provide } from '../../../../../../src';
import { PlanB } from './circular';

@provide()
export class PlanA {
  @inject()
  helloService: any;
  @inject()
  planB: PlanB;
}
