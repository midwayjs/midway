import {
  Controller,
  Post,
  Get,
  Provide,
  Inject,
  Query,
  Body,
  SetHeader,
  App
} from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: any;

  @Inject()
  userService: UserService;

  @App()
  app;

  @Post()
  async postData(@Body('bbbbb') bbbb) {
    return 'data';
  }

  @Get('/set_header')
  @SetHeader('bbb', 'aaa')
  @SetHeader({
    'ccc': 'ddd'
  })
  async homeSet() {
    return 'bbb';
  }

  @Get('/', { middleware: [] })
  async home(@Query('name') name: string) {
    return this.app.hello + ' ' + name;
  }

}
