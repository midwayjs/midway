import { Provide } from '@midwayjs/core';

@Provide('userService')
export class UserService {
  getMessage() {
    return 'hello world';
  }
}
