import { Provide } from '../../../../../../src';

@Provide()
export class UserManager {
  async getUser() {
    return 'harry';
  }
}
