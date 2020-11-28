import {
  Controller,
  Post,
  Get,
  Provide,
  Inject,
  Query,
  Body,
  HttpCode,
  Redirect, SetHeader,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayExpressContext, IMidwayExpressRequest } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {

  @Inject()
  ctx: IMidwayExpressContext;

  @Inject()
  req: IMidwayExpressRequest;

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

}
