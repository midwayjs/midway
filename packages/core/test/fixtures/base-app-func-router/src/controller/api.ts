import {
  Controller,
  Get,
  Provide,
  Inject,
  Logger,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Provide()
@Controller('/api', { middleware: ['auth'] })
export class APIController {
  @Inject()
  ctx: any;

  @Inject()
  userService: UserService;

  @Logger()
  logger;

  @Get('/', { middleware: ['auth2'] })
  async homeSet() {
    return 'bbb';
  }
}
