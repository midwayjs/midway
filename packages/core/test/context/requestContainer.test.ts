import {
  MidwayContainer as Container,
  MidwayRequestContainer as RequestContainer,
  REQUEST_OBJ_CTX_KEY
} from '../../src';
import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import {
  AppService,
  AutoScaleService,
  CCController,
  CircularOne,
  CircularThree,
  CircularTwo,
  FunService,
  GatewayManager,
  GatewayService,
  GroupService,
  ScaleManager,
  TenService,
  TestOne,
  TestOne1,
  TestThree,
  TestThree1,
  TestTwo,
  TestTwo1,
} from '../fixtures/circular_dependency';

@Provide()
class Tracer {
  get parentId() {
    return '321';
  }
}

@Provide()
class DataCollector {
  id = Math.random();

  getData() {
    return this.id + 'hello';
  }
}

@Provide('tracer')
@Scope(ScopeEnum.Request)
class ChildTracer extends Tracer {
  id = Math.random();

  @Inject('dataCollector')
  collector: DataCollector;

  get parentId() {
    return '123';
  }

  get traceId() {
    return this.id;
  }

  getData() {
    return this.collector.getData();
  }
}

describe('/test/context/requestContainer.test.ts', () => {
  it('should create request container more then once and get same value from parent', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector,{
      scope: ScopeEnum.Singleton
    });
    appCtx.bind(ChildTracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    const reqCtx2 = new RequestContainer({}, appCtx);
    expect(reqCtx1.get<Tracer>(ChildTracer).parentId).toEqual(
      reqCtx2.get<Tracer>(ChildTracer).parentId
    );
    expect((await reqCtx1.getAsync(ChildTracer)).parentId).toEqual(
      (await reqCtx2.getAsync(ChildTracer)).parentId
    );
  });

  it('should get same object in same request context', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector, {
      scope: ScopeEnum.Singleton
    });
    appCtx.bind(ChildTracer);

    const reqCtx = new RequestContainer({}, appCtx);

    const tracer1 = await reqCtx.getAsync('tracer');
    const tracer2 = await reqCtx.getAsync('tracer');
    expect(tracer1.traceId).toEqual(tracer2.traceId);

    const reqCtx2 = new RequestContainer({}, appCtx);
    const tracer3 = await reqCtx2.getAsync('tracer');
    const tracer4 = await reqCtx2.getAsync('tracer');
    expect(tracer3.traceId).toEqual(tracer4.traceId);
    expect(tracer1.traceId).not.toEqual(tracer3.traceId);
    expect(tracer2.traceId).not.toEqual(tracer4.traceId);
  });

  it('should get different property value in different request context', async () => {
    const appCtx = new Container();
    appCtx.bind('tracer', Tracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    reqCtx1.registerObject('tracer', new ChildTracer());
    const reqCtx2 = new RequestContainer({}, appCtx);
    reqCtx2.registerObject('tracer', new ChildTracer());

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1.parentId).toEqual('123');
    expect(tracer2.parentId).toEqual('123');

    expect(tracer1.traceId).not.toEqual(tracer2.traceId);
  });

  it('should get singleton object in different request scope object', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector, {
      scope: ScopeEnum.Singleton
    });
    appCtx.bind(ChildTracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    const reqCtx2 = new RequestContainer({}, appCtx);

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1.parentId).toEqual('123');
    expect(tracer2.parentId).toEqual('123');

    expect(tracer1.traceId).not.toEqual(tracer2.traceId);
    expect(tracer1.getData()).toEqual(tracer2.getData());
  });

  it('should get ctx from object in requestContainer', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector,{
      scope: ScopeEnum.Singleton
    });
    appCtx.bind(ChildTracer);

    const ctx1 = { a: 1 };
    const ctx2 = { b: 2 };
    const reqCtx1 = new RequestContainer(ctx1, appCtx);
    const reqCtx2 = new RequestContainer(ctx2, appCtx);

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1[REQUEST_OBJ_CTX_KEY]).toEqual(ctx1);
    expect(tracer2[REQUEST_OBJ_CTX_KEY]).toEqual(ctx2);
  });

  it('circular should be ok in requestContainer', async () => {
    const appCtx = new Container();

    appCtx.bind(TestOne);
    appCtx.bind(TestTwo);
    appCtx.bind(TestThree);
    appCtx.bind(TestOne1);
    appCtx.bind(TestTwo1);
    appCtx.bind(TestThree1);
    appCtx.bind(CircularOne);
    appCtx.bind(CircularTwo);
    appCtx.bind(CircularThree);

    const ctx1 = { a: 1 };
    const container = new RequestContainer(ctx1, appCtx);
    const circularTwo: CircularTwo = await container.getAsync(CircularTwo);
    expect(circularTwo.test2).toEqual('this is two');
    expect((circularTwo.circularOne as CircularOne).test1).toEqual('this is one');
    expect(
      ((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo)
        .test2
    ).toEqual('this is two');

    const one = await container.getAsync<TestOne1>(TestOne1);
    expect(one).toBeDefined();
    expect(one).toBeDefined();
    expect(one.name).toEqual('one');
    expect((one.two as TestTwo1).name).toEqual('two');
  });

  it('circular depth should be ok in requestContainer', async () => {
    const appCtx = new Container();
    appCtx.bind(GatewayManager);
    appCtx.bind(GatewayService);
    appCtx.bind(GroupService);
    appCtx.bind(FunService);
    appCtx.bind(AppService);
    appCtx.bind(TenService);
    appCtx.bind(ScaleManager);
    appCtx.bind(AutoScaleService);
    appCtx.bind(CCController);

    const ctx1 = { a: 1 };
    const container = new RequestContainer(ctx1, appCtx);
    const one = await container.getAsync<CCController>(CCController);
    expect(one).toBeDefined();
    expect(one).toBeDefined();
    expect(one.ts).toEqual('controller');

    expect((one.autoScaleService as any).ts).toEqual('ascale');
    expect((one.autoScaleService as any).scaleManager.ts).toEqual('scale');
  });

  it('test getService in requestContainer', async () => {
    const appCtx = new Container();
    // 合并 egg config
    const configService = appCtx.getConfigService();
    configService.addObject({
      name: 'zhangting',
    });
    appCtx.bind(GatewayManager);
    await appCtx.ready();

    const ctx1 = { a: 1 };
    const container = new RequestContainer(ctx1, appCtx);
    const defaultConfig = container.getConfigService().getConfiguration();
    expect(defaultConfig.name).toEqual('zhangting');
    const defaultEnv = container
      .getEnvironmentService()
      .getCurrentEnvironment();
    expect(defaultEnv).toEqual('test');
  });

  it('test request scope inject request scope', async () => {
    @Provide()
    @Scope(ScopeEnum.Request)
    class B {
      bid = Math.random();
      @Inject()
      ctx;
    }

    @Provide()
    @Scope(ScopeEnum.Request)
    class A {
      aid = Math.random();
      @Inject()
      b: B;
      @Inject()
      ctx;
    }

    const appCtx = new Container();
    appCtx.bind(A);
    appCtx.bind(B);

    const a1 = await appCtx.getAsync(A);

    // 创建请求作用域
    const requestContainer = new RequestContainer({c:1}, appCtx);
    const a2 = await requestContainer.getAsync(A);
    // 请求 ctx 是否正确
    expect(a2.ctx.c).toEqual(1);
    expect(a2.b.ctx.c).toEqual(1);
    // 单例和请求作用域非同一实例
    expect(a1.aid).not.toEqual(a2.aid);
    expect(a1.b.bid).not.toEqual(a2.b.bid);
  });

  it('should test request scope inject singleton scope', async () => {
    @Provide()
    @Scope(ScopeEnum.Singleton)
    class B {
      bid = Math.random();
      @Inject()
      ctx;
    }

    @Provide()
    @Scope(ScopeEnum.Request)
    class A {
      aid = Math.random();
      @Inject()
      b: B;
      @Inject()
      ctx;
    }

    const appCtx = new Container();
    appCtx.bind(A);
    appCtx.bind(B);

    // 创建请求作用域
    const requestContainer1 = new RequestContainer({c:1}, appCtx);
    const a1 = await requestContainer1.getAsync(A);
    const requestContainer2 = new RequestContainer({d:1}, appCtx);
    const a2 = await requestContainer2.getAsync(A);
    // 请求 ctx 是否正确
    expect(a1.ctx.c).toEqual(1);
    expect(a1.b.ctx).toEqual({});
    expect(a2.ctx.d).toEqual(1);
    expect(a2.b.ctx).toEqual({});
    // 是否同一单例
    expect(a1.aid).not.toEqual(a2.aid);
    expect(a1.b.bid).toEqual(a2.b.bid);
  });

  it('should test singleton scope inject request scope', async () => {
    @Provide()
    @Scope(ScopeEnum.Request)
    class B {
      bid = Math.random();
      @Inject()
      ctx;
    }

    @Provide()
    @Scope(ScopeEnum.Singleton)
    class A {
      aid = Math.random();
      @Inject()
      b: B;
      @Inject()
      ctx;
    }

    const appCtx = new Container();
    appCtx.bind(A);
    appCtx.bind(B);

    // 创建请求作用域
    const requestContainer1 = new RequestContainer({c:1}, appCtx);
    const a1 = await requestContainer1.getAsync(A);
    const requestContainer2 = new RequestContainer({d:1}, appCtx);
    const a2 = await requestContainer2.getAsync(A);
    // 请求 ctx 是否正确
    expect(a1.ctx).toEqual({});
    expect(a1.b.ctx).toEqual({});
    expect(a2.ctx).toEqual({});
    expect(a2.b.ctx).toEqual({});
    // 是否同一单例
    expect(a1.aid).toEqual(a2.aid);
    expect(a1.b.bid).toEqual(a2.b.bid);
  });
});
