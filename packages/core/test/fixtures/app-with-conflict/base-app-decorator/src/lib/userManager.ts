import { Provide } from '../../../../../../src';

@Provide()
export class UserManager {
  async getUser() {
    return 'harry';
  }
}

@Provide()
export class BaseService {
  async getInformation() {
    return 'this is conflict';
  }
}
