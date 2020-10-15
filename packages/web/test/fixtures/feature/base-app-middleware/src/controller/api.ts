import { Controller, Get, Inject, Provide, } from '@midwayjs/decorator';
import { IMidwayWebContext } from '../../../../../../src';

@Provide()
@Controller('/', { middleware: ['globalMiddleware3'] })
export class APIController {
  @Inject()
  ctx: IMidwayWebContext;

  @Get('/', { middleware: ['globalMiddleware4'] })
  async home() {
    return this.ctx.state['a'] + this.ctx.state['b'] + this.ctx.state['c'] + this.ctx.state['d'] + this.ctx.oldData;
  }

}
