import { Provide, Controller, Get, Inject } from '@midwayjs/core';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  req;

  @Get('/local-passport', { middleware: ['local'] })
  async localPassport() {
    if (
      this.req.user?.username === 'admin' &&
      this.req.user?.password === '123'
    ) {
      return 'success';
    }

    return 'fail';
  }
}
