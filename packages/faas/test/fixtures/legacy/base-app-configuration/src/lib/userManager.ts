import { Provide } from '@midwayjs/core';

@Provide()
export class UserManager {
  async getUser() {
    return 'harry';
  }
}
