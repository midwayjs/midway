import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  ctx;

  @Get('/local-passport', )
  async localPassport() {
    if (
      this.ctx.req.user?.username === 'admin' &&
      this.ctx.req.user?.password === '123'
    ) {
      return 'success';
    }

    return 'fail';
  }
}
