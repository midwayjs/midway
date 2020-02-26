import { Provide } from '@midwayjs/decorator';

@Provide()
export class TestService {
  invoke() {
    return 'test';
  }
}
