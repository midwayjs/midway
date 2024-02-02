import { Controller, Get, Inject } from '@midwayjs/core';

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
      return this.ctx.isAuthenticated() ? 'success': 'fail';
    }

    return 'fail';
  }
}
