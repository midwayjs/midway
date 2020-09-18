import { Aspect, Provide } from '@midwayjs/decorator';
import { MyAspect1 } from './aspect/a';

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
@Aspect([MyAspect1])
@Aspect(['myAspect2'], '*2')
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
