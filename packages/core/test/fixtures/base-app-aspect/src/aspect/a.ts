import { IAspect, JoinPoint, Provide } from '@midwayjs/decorator';

@Provide()
export class MyAspect1 implements IAspect {
  around(point: JoinPoint): any {
    point.proceed();
  }
}
