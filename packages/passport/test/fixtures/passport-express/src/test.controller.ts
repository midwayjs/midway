import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  ctx;

  @Get('/local-passport', { middleware: ['local'] })
  async localPassport() {
    if (
      this.ctx.req.user?.username === 'admin' &&
      this.ctx.req.user?.password === '123'
    ) {
      return 'success';
    }

    return 'fail';
  }

  @Get('/local-passport2', { middleware: ['local2'] })
  async localPassport2(ctx) {
    if (
      this.ctx.req.user?.username === 'admin' &&
      this.ctx.req.user?.password === '123'
    ) {
      return 'success';
    }

    return 'fail';
  }
}
