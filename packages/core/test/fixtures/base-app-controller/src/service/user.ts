import { Provide } from '../../../../../src';

@Provide()
export class UserService {
  async hello(name) {
    return {
      name,
    };
  }
}
