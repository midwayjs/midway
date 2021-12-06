import { Inject, Controller, Get } from '@midwayjs/decorator';
import { UserService } from '../service/user';

@Controller('/')
export class HomeController {

  @Inject()
  userService: UserService;

  @Get('/')
  async index() {
    return this.userService.getUser();
  }
}
