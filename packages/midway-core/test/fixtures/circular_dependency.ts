import {Provide, Inject, Scope} from '@midwayjs/decorator';
import { ScopeEnum } from '../../src';

@Provide()
@Scope(ScopeEnum.Request)
export class CircularTwo {
  public ooo;
  constructor(@Inject() circularOne: any) {
    this.ts = Date.now();
    this.ooo = circularOne;
  }
  @Inject()
  public circularOne: any;
  public ts: number;

  public test2 = 'this is two';

  public async ctest2(a: any): Promise<any> {
    return a + (await this.circularOne.ctest1('two'));
  }

  public ttest2(b: any) {
    return b + this.circularOne.test2('two');
  }
}

@Provide()
@Scope(ScopeEnum.Request)
export class CircularOne {
  constructor() {
    this.ts = Date.now();
  }
  @Inject()
  public circularTwo: any;
  public ts: number;

  public test1 = 'this is one';

  public async ctest1(a: any): Promise<any> {
    return a + 'one';
  }

  public test2(b: any) {
    return b + 'one';
  }
}

@Provide()
@Scope(ScopeEnum.Request)
export class CircularThree {
  constructor() {
    this.ts = Date.now();
  }
  @Inject()
  public circularTwo: any;
  public ts: number;
}
