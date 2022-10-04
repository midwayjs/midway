import {
  Controller,
  Get,
  Provide,
  Inject,
  Query,
  HttpCode,
} from '@midwayjs/core';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: any;

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query('name') name: string) {
    return 'hello world,' + name;
  }
}
