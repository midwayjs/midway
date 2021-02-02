import {
  Controller,
  Get,
  Provide,
  Inject,
  Query,
} from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: any;

  @Get('/')
  async home(@Query('name') name: string) {
    this.ctx.logger.info('custom label');
    return 'hello world,' + name;
  }
}
