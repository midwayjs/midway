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
import { IMidwayExpressRequest } from '../../../../../src';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  req: IMidwayExpressRequest;

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
  async redirect() {
  }

}
