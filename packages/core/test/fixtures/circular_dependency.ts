import {Provide, Inject, Scope} from '@midwayjs/decorator';
import { ScopeEnum } from '../../src';
@Provide()
export class TestOne1 {
  name = 'one';

  @Inject('testTwo1')
  two: any;
}
@Provide()
export class TestTwo1 {
  name = 'two';

  @Inject('testOne1')
  testOne: any;
}
@Provide()
export class TestThree1 {
  name = 'three';

  @Inject('testTwo1')
  two: any;
}
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

@Provide()
@Scope(ScopeEnum.Prototype)
export class TestOne {
  ts = 'this is one';
  @Inject()
  testTwo: any;

  @Inject('testOne')
  one: any;
}

@Provide()
export class TestTwo {
  ts = 'this is two';
  one: any;
  constructor(@Inject() testOne: TestOne) {
    this.one = testOne;
  }

  @Inject('testOne')
  one1: any;
}
@Provide()
export class TestThree {
  ts = 'this is three';

  @Inject('testOne')
  one: any;
}

@Provide()
export class GatewayManager {
  ts = 'gtmanager';
  @Inject()
  groupService: GroupService;
  @Inject()
  funService: FunService;
  @Inject()
  appService: AppService;
}

@Provide()
export class GatewayService {
  ts = 'gateway';
  @Inject()
  appService: AppService;
  @Inject()
  funService: FunService;
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  groupService: GroupService;
}
@Provide()
export class GroupService {
  ts = 'group';
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  tenService: TenService;
  @Inject()
  appService: AppService;
}
@Provide()
export class FunService {

}
@Provide()
export class AppService {

}
@Provide()
export class TenService {

}
@Provide()
export class ScaleManager {
  ts = 'scale';
  @Inject()
  tenService: TenService;
  @Inject()
  appService: AppService;
  @Inject()
  funService: FunService;
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  groupService: GroupService;

  @Inject()
  autoScaleService: AutoScaleService;
}

@Provide()
export class AutoScaleService {
  ts = 'ascale';
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  groupService: GroupService;
  @Inject()
  scaleManager: ScaleManager;
}

@Provide()
export class CCController {
  ts = 'controller';
  @Inject()
  autoScaleService: AutoScaleService;
}
