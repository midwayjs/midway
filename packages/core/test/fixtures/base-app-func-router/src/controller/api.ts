import {
  Controller,
  Get,
  Provide,
  Inject,
  Logger,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: any;

  @Inject()
  userService: UserService;

  @Logger()
  logger;

  @Get('/')
  async homeSet() {
    return 'bbb';
  }
}
