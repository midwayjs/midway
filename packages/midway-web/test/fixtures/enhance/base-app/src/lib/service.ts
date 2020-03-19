import { Provide } from '@midwayjs/decorator';

@Provide()
export class UserService {
  async hello() {
    return 'world';
  }
}
