import { Provide, Controller, Get, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/user')
export class ControllerTestService {

  @Inject()
  ctx;

  @Get('/')
  async handler() {
    return 'user'
  }

  @Get('/:test')
  async test() {
    return this.ctx.params.test;
  }
}
