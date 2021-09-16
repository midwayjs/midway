import { Provide, Inject, Scope, ScopeEnum } from '@midwayjs/decorator';

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
  @Inject('circularOne')
  public ooo;
  constructor() {
    this.ts = Date.now();
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
  @Inject('testOne')
  one: any;

  @Inject('testOne')
  one1: any;
}
@Provide()
export class TestThree {
  ts = 'this is three';

  @Inject('testOne')
  one: any;
}

interface IGroupService {}
interface IFunService {}
interface IAppService {}
interface ITenService {}
interface IAutoScaleService {}

@Provide()
export class GatewayManager {
  ts = 'gtmanager';
  @Inject()
  groupService: IGroupService;
  @Inject()
  funService: IFunService;
  @Inject()
  appService: IAppService;
}

@Provide()
export class GatewayService {
  ts = 'gateway';
  @Inject()
  appService: IAppService;
  @Inject()
  funService: IFunService;
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  groupService: IGroupService;
}
@Provide()
export class GroupService implements IGroupService {
  ts = 'group';
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  tenService: ITenService;
  @Inject()
  appService: IAppService;
}
@Provide()
export class FunService implements IFunService {

}
@Provide()
export class AppService implements IAppService {

}
@Provide()
export class TenService implements ITenService {

}
@Provide()
export class ScaleManager {
  ts = 'scale';
  @Inject()
  tenService: ITenService;
  @Inject()
  appService: IAppService;
  @Inject()
  funService: IFunService;
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  groupService: IGroupService;

  @Inject()
  autoScaleService: IAutoScaleService;
}

@Provide()
export class AutoScaleService implements IAutoScaleService {
  ts = 'ascale';
  @Inject()
  gatewayManager: GatewayManager;
  @Inject()
  gatewayService: GatewayService;
  @Inject()
  groupService: IGroupService;
  @Inject()
  scaleManager: ScaleManager;
}

@Provide()
export class CCController {
  ts = 'controller';
  @Inject()
  autoScaleService: IAutoScaleService;
}
