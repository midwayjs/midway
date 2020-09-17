import { IAspect, JoinPoint, Provide } from '@midwayjs/decorator';

@Provide()
export class MyAspect1 implements IAspect {
  before(point: JoinPoint): any {
    point.args = ['ddd']
  }
}
