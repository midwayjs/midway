import { expect } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import { XmlApplicationContext } from '../../../../src/factory/xml/XmlApplicationContext';

let baseDir = path.resolve(__dirname, '../../../fixtures/app');
let context: XmlApplicationContext;
let ctx1: XmlApplicationContext;

describe('/test/unit/factory/xml/XmlApplicationContext', () => {
  before(async () => {
    context = new XmlApplicationContext(baseDir);
    context.configLocations = ['resources/context.xml'];
    await context.ready();

    ctx1 = new XmlApplicationContext(baseDir);
    ctx1.configLocations = ['resources/list.xml', 'resources/object.xml'];
    await ctx1.ready();
  });
  it('context load dir should be ok', async () => {
    const ctx2 = new XmlApplicationContext(baseDir);
    ctx2.configLocations = ['resources'];
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

    const cowboy = context.get('cowboy');
    console.log('---- cowboy', cowboy);

    const obj3: any = context.get('ctor:obj3');
    console.log('---- obj3 111', obj3, obj3.say(), obj3.cowboy);
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
    expect(foo.boolean).eq(true);
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
      const ctx = new XmlApplicationContext(baseDir);
      ctx.configLocations = <any>'hello';
      await ctx.ready();
    } catch(e) {
      callback(e.message);
    }
    expect(callback.called).true;
    expect(callback.withArgs('loadDefinitions fail configLocations is not array!').calledOnce).true;
  });
  it('context registry getDefinitionByName should be ok', () => {
    const arr = context.registry.getDefinitionByName('object');
    expect(arr).is.not.null;
    expect(arr.length).greaterThan(0);
  });
  it('context construct-method should be only once', () => {
    const obj6 = context.get('ctor:obj6');

    const obj62 = context.get('ctor:obj6');

    expect(obj6).deep.eq(obj62);

    const obj63 = context.get('ctor:obj6');

    expect(obj62).deep.eq(obj63);
    expect(obj6).deep.eq(obj63);
  });
  it('context constructor-arg object should be ok', () => {
    const aa: any = context.get('ctor:obj7');
    expect(aa.getHello()).eq('hello');

    const aa1: any = context.get('ctor:obj8');
    expect(aa1.getHello()).eq('hello8');
  });
});
