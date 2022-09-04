import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator';
import { IMidwayKoaContext } from '../../../../../src';

@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/')
  async home() {
    this.ctx.locals = {
      b: 2,
    }
    this.ctx.state['a'] = 1;

    return {
      locals: this.ctx.locals,
      state: this.ctx.state,
    }
  }

}
