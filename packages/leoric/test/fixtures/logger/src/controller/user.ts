import { Controller, Get, Inject } from "@midwayjs/core";
import { UserService } from '../service/user';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list() {
    return await this.userService.list();
  }
}
