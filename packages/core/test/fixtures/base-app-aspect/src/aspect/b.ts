import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { Home } from "../home";

@Provide()
@Aspect([Home], '*2', 1)
export class MyAspect2 implements IMethodAspect {

  async before(point: JoinPoint) {
    console.log('change args in aspect2');
    point.args = ['ccc', 'ppp']
  }

  async around(point: JoinPoint) {
    console.log('before around in aspect2');
    const data = await point.proceed(...point.args);
    console.log('after around in aspect2');
    return data;
  }
}
