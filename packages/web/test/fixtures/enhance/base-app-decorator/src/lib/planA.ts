import { Inject, Provide } from '@midwayjs/decorator';
import { PlanB } from './circular';

@Provide()
export class PlanA {
  @Inject()
  helloService: any;
  @Inject()
  planB: PlanB;
}
