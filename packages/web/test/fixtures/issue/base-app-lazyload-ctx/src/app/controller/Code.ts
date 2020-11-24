import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Service } from '../../Service';
import { Context } from 'egg';

@Provide()
@Controller('/api/code')
export class CodeController {
  @Inject()
  ctx: Context;

  @Inject()
  service: Service;

  @Get('/list')
  async api() {
    this.ctx.body = await this.service.code.list();
  }
}
