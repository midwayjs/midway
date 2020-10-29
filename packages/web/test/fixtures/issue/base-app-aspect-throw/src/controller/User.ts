import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: any;

  @Get('/info')
  async api() {
    throw new Error('bbb');
  }

  @Get('/ctx_bind')
  async doTestCtxBind() {
    console.log(this.ctx.path);
    return this.ctx.query.text;
  }
}
