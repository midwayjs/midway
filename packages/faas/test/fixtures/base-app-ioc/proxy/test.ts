import { Provide } from '@midwayjs/core';

@Provide()
export class TestService {
  invoke() {
    return 'test';
  }
}
