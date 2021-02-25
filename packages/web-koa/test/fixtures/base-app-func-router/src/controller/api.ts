import {
  Controller,
  Get,
  Provide,
  Inject,
  Logger,
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

  @Logger()
  logger;

  @Get('/')
  async homeSet() {
    return 'bbb';
  }
}
