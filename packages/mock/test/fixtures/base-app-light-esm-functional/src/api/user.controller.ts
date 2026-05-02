import { Inject, Provide } from '@midwayjs/core';
import { UserService } from '../service/user.service.js';

@Provide('userController')
export class UserController {
  @Inject('userService')
  userService: UserService;

  show() {
    return this.userService.getMessage();
  }
}
