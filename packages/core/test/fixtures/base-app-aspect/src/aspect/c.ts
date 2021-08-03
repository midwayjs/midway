import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { UserController } from '../home';
import * as assert from 'assert';

@Provide()
@Aspect([UserController])
export class MyAspect3 implements IMethodAspect {
  afterThrow(point: JoinPoint, err): any {
    assert.ok(this instanceof MyAspect3);
    if (err.message === 'bbb') {
      throw new Error('ccc');
    }
  }
  async before(point: JoinPoint) {
    console.log('before around in aspect3');
    console.log('before methodName:', point.methodName);
    point.args = ['before test user'];
  }
}
