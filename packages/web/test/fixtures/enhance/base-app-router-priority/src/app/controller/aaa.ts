import { Provide, Controller, Get } from '@midwayjs/decorator';

@Provide()
@Controller('/api')
export class APIController {

  @Get('/hello')
  async index(ctx) {
    ctx.body = 'api';
  }

}
