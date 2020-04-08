import { Func, Provide } from '@midwayjs/decorator';

@Provide()
export class Test {

  @Func('test.hand')
  async handler() {
    return 'hello world';
  }
}