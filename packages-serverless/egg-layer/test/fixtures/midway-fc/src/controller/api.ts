import {
  Controller,
  Post,
  Provide,
  Inject,
  Body,
  ContentType,
  Param,
  Get,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: any;

  @Inject()
  userService: UserService;

  @Post('/api')
  @ContentType('html')
  async postData(@Body('bbbbb') bbbb) {
    return 'data' + bbbb;
  }

  @Get('/echo/:param')
  async echoParam(@Param() param: string) {
    console.log('[echo param]', param);
    return param;
  }
}
