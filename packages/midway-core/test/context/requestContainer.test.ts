import { expect } from 'chai';
import { MidwayContainer as Container, REQUEST_OBJ_CTX_KEY, MidwayRequestContainer as RequestContainer, ScopeEnum } from '../../src';
import { Inject, Provide, Scope } from '@midwayjs/decorator';

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
    expect(reqCtx1.get<Tracer>(ChildTracer).parentId).to.equal(reqCtx2.get<Tracer>(ChildTracer).parentId);
    expect((await reqCtx1.getAsync(ChildTracer)).parentId).to.equal((await reqCtx2.getAsync(ChildTracer)).parentId);
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

    expect(tracer1[ REQUEST_OBJ_CTX_KEY ]).to.equal(ctx1);
    expect(tracer2[ REQUEST_OBJ_CTX_KEY ]).to.equal(ctx2);
  });

});
