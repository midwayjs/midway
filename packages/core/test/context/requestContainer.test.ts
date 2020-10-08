import { expect } from 'chai';
import {
  MidwayContainer as Container,
  REQUEST_OBJ_CTX_KEY,
  MidwayRequestContainer as RequestContainer,
  ScopeEnum,
} from '../../src';
import { Inject, Provide, Scope } from '@midwayjs/decorator';
import {
  CircularOne,
  CircularTwo,
  CircularThree,
  TestOne,
  TestTwo,
  TestThree,
  TestOne1,
  TestTwo1,
  TestThree1,
  GatewayManager,
  GatewayService,
  GroupService,
  FunService,
  AppService,
  TenService,
  ScaleManager,
  AutoScaleService,
  CCController,
} from '../fixtures/circular_dependency';

class Tracer {
  get parentId() {
    return '321';
  }
}

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
    appCtx.bind(DataCollector);
    appCtx.bind(ChildTracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    const reqCtx2 = new RequestContainer({}, appCtx);
    expect(reqCtx1.get<Tracer>(ChildTracer).parentId).to.equal(
      reqCtx2.get<Tracer>(ChildTracer).parentId
    );
    expect((await reqCtx1.getAsync(ChildTracer)).parentId).to.equal(
      (await reqCtx2.getAsync(ChildTracer)).parentId
    );
  });

  it('should get same object in same request context', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector);
    appCtx.bind(ChildTracer);

    const reqCtx = new RequestContainer({}, appCtx);

    const tracer1 = await reqCtx.getAsync('tracer');
    const tracer2 = await reqCtx.getAsync('tracer');
    expect(tracer1.traceId).to.equal(tracer2.traceId);

    const reqCtx2 = new RequestContainer({}, appCtx);
    const tracer3 = await reqCtx2.getAsync('tracer');
    const tracer4 = await reqCtx2.getAsync('tracer');
    expect(tracer3.traceId).to.equal(tracer4.traceId);
    expect(tracer1.traceId).to.not.equal(tracer3.traceId);
    expect(tracer2.traceId).to.not.equal(tracer4.traceId);
  });

  it('should get different property value in different request context', async () => {
    const appCtx = new Container();
    appCtx.bind('tracer', Tracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    await reqCtx1.ready();
    expect(reqCtx1.isReady).true;

    reqCtx1.registerObject('tracer', new ChildTracer());
    const reqCtx2 = new RequestContainer({}, appCtx);
    reqCtx2.registerObject('tracer', new ChildTracer());

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1.parentId).to.equal('123');
    expect(tracer2.parentId).to.equal('123');

    expect(tracer1.traceId).to.not.equal(tracer2.traceId);
  });

  it('should get singleton object in different request scope object', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector);
    appCtx.bind(ChildTracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    const reqCtx2 = new RequestContainer({}, appCtx);

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1.parentId).to.equal('123');
    expect(tracer2.parentId).to.equal('123');

    expect(tracer1.traceId).to.not.equal(tracer2.traceId);
    expect(tracer1.getData()).to.equal(tracer2.getData());
  });

  it('should get ctx from object in requestContainer', async () => {
    const appCtx = new Container();
    appCtx.bind(DataCollector);
    appCtx.bind(ChildTracer);

    const ctx1 = { a: 1 };
    const ctx2 = { b: 2 };
    const reqCtx1 = new RequestContainer(ctx1, appCtx);
    const reqCtx2 = new RequestContainer(ctx2, appCtx);

    const tracer1 = await reqCtx1.getAsync('tracer');
    const tracer2 = await reqCtx2.getAsync('tracer');

    expect(tracer1[REQUEST_OBJ_CTX_KEY]).to.equal(ctx1);
    expect(tracer2[REQUEST_OBJ_CTX_KEY]).to.equal(ctx2);
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
    expect(circularTwo.test2).eq('this is two');
    expect((circularTwo.circularOne as CircularOne).test1).eq('this is one');
    expect(
      ((circularTwo.circularOne as CircularOne).circularTwo as CircularTwo)
        .test2
    ).eq('this is two');

    const one = await container.getAsync<TestOne1>(TestOne1);
    expect(one).not.null;
    expect(one).not.undefined;
    expect(one.name).eq('one');
    expect((one.two as TestTwo1).name).eq('two');
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
    expect(one).not.null;
    expect(one).not.undefined;
    expect(one.ts).eq('controller');

    expect((one.autoScaleService as any).ts).eq('ascale');
    expect((one.autoScaleService as any).scaleManager.ts).eq('scale');
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
    expect(defaultConfig.name).to.equal('zhangting');
    const defaultEnv = container
      .getEnvironmentService()
      .getCurrentEnvironment();
    const currentEnv = container.getCurrentEnv();
    expect(defaultEnv).to.equal('test');
    expect(currentEnv).to.equal(defaultEnv);
  });
});
