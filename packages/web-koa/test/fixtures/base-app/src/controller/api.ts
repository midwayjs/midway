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
import { IMidwayKoaContext } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

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
  async postData(@Body() bbbb) {
    return 'data';
  }

  @Get('/', { middleware: [] })
  @HttpCode(201)
  async home(@Query() name: string, @Query() age: number) {
    return 'hello world,' + name + age;
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {}
}
