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
}
