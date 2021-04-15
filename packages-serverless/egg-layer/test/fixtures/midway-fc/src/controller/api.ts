import {
  Controller,
  Post,
  Provide,
  Inject,
  Body, ContentType,
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

}
