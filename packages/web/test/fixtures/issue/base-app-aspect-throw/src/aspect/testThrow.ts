import { Aspect, IMethodAspect, JoinPoint, Provide } from '@midwayjs/decorator';
import { UserController } from '../controller/User';
import * as assert from 'assert';

@Provide()
@Aspect(UserController, 'api')
export class ReportInfo implements IMethodAspect {
  async afterThrow(point: JoinPoint, err) {
    assert.ok(this instanceof ReportInfo);
    point.target.ctx.status = 200;
    point.target.ctx.body = 'hello';
  }
}

@Provide()
@Aspect(UserController, 'do*')
export class ReportInfo1 implements IMethodAspect {
  async around(point: JoinPoint) {
    assert.ok(this instanceof ReportInfo1);
    const result = await point.proceed(...point.args);  // 执行原方法
    return result + ' world';
  }
}

