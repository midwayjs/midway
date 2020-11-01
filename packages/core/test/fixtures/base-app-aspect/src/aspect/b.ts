import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { Home } from '../home';
import * as assert from 'assert';

@Provide()
@Aspect([Home], '*2', 1)
export class MyAspect2 implements IMethodAspect {

  async before(point: JoinPoint) {
    assert.ok(this instanceof MyAspect2);
    console.log('change args in aspect2');
    point.args = ['ccc', 'ppp']
  }

  async around(point: JoinPoint) {
    assert.ok(this instanceof MyAspect2);
    console.log('before around in aspect2');
    const data = await point.proceed(...point.args);
    console.log('after around in aspect2');
    return data;
  }
}
