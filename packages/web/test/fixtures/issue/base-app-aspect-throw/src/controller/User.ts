import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: any;

  @Get('/info')
  async api() {
    assert.ok(this instanceof UserController);
    throw new Error('bbb');
  }

  @Get('/ctx_bind')
  async doTestCtxBind() {
    assert.ok(this instanceof UserController);
    return this.ctx.query.text;
  }
}
