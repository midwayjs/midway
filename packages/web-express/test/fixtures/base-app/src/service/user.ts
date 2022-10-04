import { Provide } from '@midwayjs/core';

@Provide()
export class UserService {
  async hello(name) {
    return {
      name,
    };
  }
}
