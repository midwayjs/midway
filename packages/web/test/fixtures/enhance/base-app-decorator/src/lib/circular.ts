import { Provide, Inject, LazyInject } from '@midwayjs/core';
import { PlanA } from './planA';

// @Provide()
// export class PlanA {
//   @Inject()
//   planB: any;
// }

@Provide()
export class PlanB {
  @LazyInject()
  planA: PlanA;
  @Inject()
  helloService: any;

  @Inject()
  AppModel: any;
}
