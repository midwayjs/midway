import {
  Controller,
  Post,
  Provide,
  Inject,
  Body,
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
  async postData(@Body('bbbbb') bbbb) {
    return 'data' + bbbb;
  }

}
