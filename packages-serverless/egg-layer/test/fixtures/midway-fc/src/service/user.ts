import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserService {
  async hello(name) {
    return {
      name,
    };
  }
}
