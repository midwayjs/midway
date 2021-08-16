import { Provide, Inject } from '@midwayjs/decorator';

class Parent {
  ddd = 'ddd';

  hello() {
    return 'hello world parent';
  }

  async hello1() {
    return 'hello world 1';
  }
}

@Provide()
export class Home extends Parent {
  bbb = 'aaa';

  ccc: string;

  hello(data1: string = 'ggg', data2: string = 'aaa', data3 = 'fff') {
    return 'hello world' + data1 + data2 + data3;
  }

  async hello2(data1: string = 'ggg', data2 = 'fff') {
    return 'hello world' + data1 + data2;
  }
}

@Provide()
export class UserController {
  @Inject()
  ctx;

  async getUser() {
    throw new Error('bbb');
  }

  async getUser1(uid = 'user1') {
    return uid;
  }

  test1() {
    return this;
  }

  test2() {
    return this;
  }
}
