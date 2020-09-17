import { Aspect, Provide } from '@midwayjs/decorator';
import { MyAspect1 } from './aspect/a';


class Parent {
  ddd = 'ddd';

  async hello() {
    return 'hello world parent';
  }

  async hello1() {
    return 'hello world 1'
  }
}

@Provide()
@Aspect(MyAspect1)
export class Home extends Parent {

  bbb = 'aaa';

  ccc: string;

  async hello() {
    this.ccc = 'ccc';
    return 'hello world';
  }
}
