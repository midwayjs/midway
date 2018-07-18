import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import { XmlApplicationContext } from '../../../../src/factory/xml/XmlApplicationContext';

let baseDir = path.resolve(__dirname, '../../../fixtures/app');
let context: XmlApplicationContext;
let ctx1: XmlApplicationContext;

describe('/test/unit/factory/xml/XmlApplicationContext', () => {
  before(async () => {
    context = new XmlApplicationContext(baseDir,
      ['resources/context.xml']);
    await context.ready();

    ctx1 = new XmlApplicationContext(baseDir,
      ['resources/list.xml', 'resources/object.xml']);
    await ctx1.ready();
  });
  it('context load dir should be ok', async () => {
    const ctx2 = new XmlApplicationContext(baseDir, ['resources']);
    await ctx2.ready();
    expect(context.isReady).true;
    expect(context.parser).not.null;
  });
  it('context init should be ok', () => {
    expect(context.isReady).true;
    expect(context.parser).not.null;
  });
  it('context get identifier should be ok', async () => {
    const obj1: any = context.get('ctor:obj1');
    expect(obj1).not.null;
    expect(obj1.say()).eq('say hello');


    const casync: any = await context.getAsync('ctor:async');
    const rt = await casync.hello('mf'); // tslint:disable-line
    expect(rt).eq('hello mf');

    const hhh = context.get('ctor:hello');
    expect(hhh).not.null;

    expect(context.props.size).greaterThan(0);
    expect(context.props.get('foo')).deep.eq({bar: '123'});

    const obj3: any = context.get('ctor:obj3');
    expect(obj3).not.null;
    expect(obj3.cowboy).not.null;
    expect(obj3.cowboy.name).eq('Spike');
  });
  it('ctx1 should be ok', async () => {
    expect(ctx1).not.null;

    const foo: any = ctx1.get('obj:foo');
    expect(foo).not.null;
    expect(foo.abc).eq('bcd');
    expect(foo.num).eq(1);
    expect(foo.int === 12).true;
    expect(foo.date.getTime()).eq(1527069046019);
    expect(foo.unknow).eq('aaa');
  });
  it('injectionpoint should be ok', () => {
    const bar: any = ctx1.get('obj:bar');
    expect(bar.inject).not.null;
    expect(bar.inject.cowboy).is.null;
    expect(bar.inject.cowboy).not.undefined;
  });
  it('context should be exception ok', async () => {
    const callback = sinon.spy();
    try {
      const ctx = new XmlApplicationContext(baseDir, <any>'hello');
      await ctx.ready();
    } catch(e) {
      callback(e.message);
    }
    expect(callback.called).true;
    expect(callback.withArgs('loadDefinitions fail configLocations is not array!').calledOnce).true;
  });
});
