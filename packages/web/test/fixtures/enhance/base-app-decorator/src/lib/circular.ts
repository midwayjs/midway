import { Provide, Inject } from '@midwayjs/decorator';
import { PlanA } from './planA';

// @Provide()
// export class PlanA {
//   @Inject()
//   planB: any;
// }

@Provide()
export class PlanB {
  @Inject()
  planA: PlanA;
  @Inject()
  helloService: any;

  @Inject()
  AppModel: any;
}
