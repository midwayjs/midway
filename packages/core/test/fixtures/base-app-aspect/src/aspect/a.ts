import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { Home } from '../home';
import * as assert from 'assert';

@Provide()
@Aspect([Home])
export class MyAspect1 implements IMethodAspect {
  before(point: JoinPoint): any {
    assert.ok(this instanceof MyAspect1);
    console.log('change args in aspect1');
    point.args = ['ddd', 'cccc'];
  }
}
