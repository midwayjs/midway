import { Get, Provide, Controller, Inject } from '@midwayjs/decorator';

@Provide()
@Controller('/case')
export class CaseController {

  @Inject()
  ctx;

  @Get('/500')
  async status500() {
    this.ctx.status = 500;
  }

  @Get('/500_1')
  async status500_1() {
    this.ctx.status = 500;
    return '';
  }

  @Get('/204')
  async status204() {
    this.ctx.status = 204;
  }

  @Get('/204_1')
  async status204_1() {
    this.ctx.status = 204;
    return '';
  }

  @Get('/204_2')
  async status204_2() {
  }

  @Get('/204_3')
  async status204_3() {
    this.ctx.status = 500;
    this.ctx.body = undefined;
  }
}
