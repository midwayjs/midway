import { Provide } from '@midwayjs/core';

@Provide()
export class HelloService {
  async say() {
    return 'hello midway';
  }
}
