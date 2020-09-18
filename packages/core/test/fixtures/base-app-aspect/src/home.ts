import { Provide } from '@midwayjs/decorator';

class Parent {
  ddd = 'ddd';

  hello() {
    return 'hello world parent';
  }

  async hello1() {
    return 'hello world 1'
  }
}

@Provide()
export class Home extends Parent {

  bbb = 'aaa';

  ccc: string;

  hello(data1: string = 'ggg', data2 = 'fff') {
    return 'hello world' + data1 + data2;
  }

  async hello2(data1: string = 'ggg', data2 = 'fff') {
    return 'hello world' + data1 + data2;
  }
}
