import { Provide, Inject } from '@midwayjs/decorator';
import { TestService } from './test';

@Provide()
export class UserService {

  @Inject()
  testService: TestService;

  async getUser() {
    let result = await this.testService.hello(1, 2);
    return result;
  }
}
