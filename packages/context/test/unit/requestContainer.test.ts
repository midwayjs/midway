import {expect} from 'chai';
import {Container, inject, provide, RequestContainer, scope, ScopeEnum} from '../../src';
// const path = require('path');

function sleep(t) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

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

@provide('tracer')
@scope(ScopeEnum.Request)
class ChildTracer extends Tracer {

  id = Math.random();

  @inject('dataCollector')
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

describe('/test/unit/requestContainer.test.ts', () => {

  it('should create request container more then once and get same value from parent', async () => {
    const appCtx = new Container();
    appCtx.bind(Tracer);

    const reqCtx1 = new RequestContainer({}, appCtx);
    const reqCtx2 = new RequestContainer({}, appCtx);
    expect(<Tracer>reqCtx1.get(Tracer).parentId).to.equal(<Tracer>reqCtx2.get(Tracer).parentId);
    expect(await reqCtx1.getAsync(Tracer).parentId).to.equal(await reqCtx2.getAsync(Tracer).parentId);
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

});
