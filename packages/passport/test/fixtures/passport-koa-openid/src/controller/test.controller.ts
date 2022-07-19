import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  ctx;

  @Get('/')
  async localPassport() {
    if (
      this.ctx.state.user?.username === 'admin' &&
      this.ctx.state.user?.password === '123'
    ) {
      return 'success';
    }

    return 'fail';
  }
}
