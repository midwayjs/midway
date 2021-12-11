import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class TestPackagesController {
  @Inject()
  req;

  @Get('/local-passport', )
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
