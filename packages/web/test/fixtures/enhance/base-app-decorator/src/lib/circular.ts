import { provide, inject } from '../../../../../../src';
import { PlanA } from './planA';

// @provide()
// export class PlanA {
//   @inject()
//   planB: any;
// }

@provide()
export class PlanB {
  @inject()
  planA: PlanA;
  @inject()
  helloService: any;

  @inject()
  AppModel: any;
}
