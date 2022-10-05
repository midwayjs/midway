import { Inject, Provide } from '@midwayjs/core';
import { PlanB } from './circular';

@Provide()
export class PlanA {
  @Inject()
  helloService: any;
  @Inject()
  planB: PlanB;
}
