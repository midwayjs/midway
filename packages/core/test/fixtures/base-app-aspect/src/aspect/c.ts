import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { UserController } from '../home';

@Provide()
@Aspect([UserController])
export class MyAspect3 implements IMethodAspect {
  afterThrow(point: JoinPoint, err): any {
    if (err.message === 'bbb') {
      throw new Error('ccc');
    }
  }
}
