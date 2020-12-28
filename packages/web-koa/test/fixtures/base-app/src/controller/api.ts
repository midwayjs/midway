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
} from '@midwayjs/decorator';
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
  async postData(@Body() bbbb) {
    return 'data';
  }

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query() name: string, @Query() age: number) {
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
}
