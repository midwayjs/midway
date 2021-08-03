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
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayExpressContext, IMidwayExpressRequest } from '../../../../../src';

@Provide()
@Controller('/api')
export class APIController {

  @Inject()
  ctx: IMidwayExpressContext;

  @Inject()
  req: IMidwayExpressRequest;

  @Logger()
  logger;

  @Inject('logger')
  ctxLogger;

  @Inject()
  userService: UserService;

  @Get('/set_header')
  @SetHeader('bbb', 'aaa')
  @SetHeader({
    'ccc': 'ddd'
  })
  async homeSet() {
    return 'bbb';
  }

  @Post()
  async postData(@Body('bbbbb') bbbb) {
    return 'data';
  }

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query('name') name: string) {
    this.ctx.logger.info('my home router');
    this.ctxLogger.info('another ctx logger');
    this.logger.warn('my home warn router')
    return 'hello world,' + name;
  }

  @Get('/204')
  async status204() {
    // empty
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {
  }

  @Get('/ctx-body')
  async getCtxBody() {
    this.ctx.res.send('ctx-body');
  }

  @Get('/header-upper')
  async getHeaderWithUppercase(@Headers('X-ABC') abc) {
    return abc;
  }

}
