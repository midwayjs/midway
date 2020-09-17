import { IAspect, JoinPoint, Provide } from '@midwayjs/decorator';

@Provide()
export class MyAspect2 implements IAspect {
  around(point: JoinPoint): any {
    point.proceed();
  }
}
