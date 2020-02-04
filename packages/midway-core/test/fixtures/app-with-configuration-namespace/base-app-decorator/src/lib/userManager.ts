import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserManager {
  async getUser() {
    return 'harry';
  }
}
