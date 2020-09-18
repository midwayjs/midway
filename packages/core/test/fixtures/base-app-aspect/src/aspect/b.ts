import { IAspect, JoinPoint, Provide } from '@midwayjs/decorator';

@Provide()
export class MyAspect2 implements IAspect {
  async before(point: JoinPoint) {
    point.args = ['ccc', 'ppp']
  }
  async around(point: JoinPoint) {
    console.log('before around in aspect2');
    const data = await point.proceed(...point.args);
    console.log('after around in aspect2');
    return data;
  }
}
