import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { Home } from '../home';

@Provide()
@Aspect([Home])
export class MyAspect1 implements IMethodAspect {
  before(point: JoinPoint): any {
    point.args = ['ddd']
  }
}
