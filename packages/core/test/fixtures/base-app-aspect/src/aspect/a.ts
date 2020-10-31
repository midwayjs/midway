import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { Home } from '../home';

@Provide()
@Aspect([Home])
export class MyAspect1 implements IMethodAspect {
  before(point: JoinPoint): any {
    console.log('change args in aspect1');
    point.args = ['ddd', 'cccc'];
  }
}
