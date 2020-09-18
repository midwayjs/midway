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

  @Post()
  async postData(@Body('bbbbb') bbbb) {
    return 'data';
  }

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query('name') name: string) {
    return 'hello world,' + name;
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {}
}
