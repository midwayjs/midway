import {
  Controller,
  Post,
  Get,
  Provide,
  Inject,
  Query,
  Body,
  HttpCode,
  Redirect,
  SetHeader,
  Logger,
  Headers,
} from '@midwayjs/core';
import { UserService } from '../service/user';
import { IMidwayKoaContext } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  userService: UserService;

  @Logger()
  logger;

  @Get('/set_header')
  @SetHeader('bbb', 'aaa')
  @SetHeader({
    'ccc': 'ddd'
  })
  async homeSet() {
    return 'bbb';
  }

  @Post()
  async postData(@Body('bbbb') bbbb) {
    return bbbb;
  }

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query('name') name: string, @Query('age') age: number) {
    this.ctx.logger.info('my home router');
    this.logger.warn('my home warn router')
    return 'hello world,' + name + age;
  }

  @Get('/204')
  async status204() {
    // empty
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {}

  @Get('/ctx-body')
  async getCtxBody() {
    this.ctx.body = 'ctx-body';
  }

  @Get('/header-upper')
  async getHeaderWithUppercase(@Headers('X-ABC') abc) {
    return abc;
  }
}
