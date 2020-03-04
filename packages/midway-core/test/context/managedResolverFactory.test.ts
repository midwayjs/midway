import { BaseManagedResolver, ManagedResolverFactory } from '../../src/context/managedResolverFactory';
import { BaseApplicationContext } from '../../src/context/applicationContext';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { expect } from 'chai';
import { ManagedProperties, ManagedValue, ManagedJSON, ManagedObject, ManagedProperty, ManagedList, ManagedSet, ManagedMap } from '../../src/context/managed';
import { VALUE_TYPE } from '../../src/common/constants';
import { ObjectProperties } from '../../src/definitions/properties';
import { IManagedResolver } from '../../src/interface';
import { IManagedInstance } from '@midwayjs/decorator';
import sinon = require('sinon');

class TestManaged implements IManagedInstance {
  type = 'test';
  val = 123;
}
class TestResolver implements IManagedResolver {
  type = 'test';
  resolve(managed: IManagedInstance): any {
    const t = managed as TestManaged;
    return 'this is a test sync' + t.val;
  }
  async resolveAsync(managed: IManagedInstance): Promise<any> {
    const t = managed as TestManaged;
    return 'this is a test' + t.val;
  }
}

describe('/test/context/managedResolverFactory.test.ts', () => {
  it('base resolver should be ok', async () => {
    const r = new BaseManagedResolver(null);
    let a = false;
    try {
      expect(r.type).true;
    } catch (e) {
      a = true;
    }
    expect(a).true;

    try {
      r.resolve(null);
    } catch (e) {
      a = true;
    }
    expect(a).true;

    try {
      await r.resolveAsync(null);
    } catch (e) {
      a = true;
    }
    expect(a).true;
  });

  it('resolver should be ok', async () => {
    const context = new BaseApplicationContext();
    context.props.addProperty('hello', { a: { b: 1 } });
    context.props.addProperty('hello1', 123);

    const resolver = new ManagedResolverFactory(context);

    let b = false;
    resolver.beforeEachCreated((clzz, args, context) => {
      b = true;
    });
    const props = new ManagedProperties();
    const val = new ManagedValue('bbb', VALUE_TYPE.STRING);
    props.addProperty('a', val);
    const cfg: ObjectProperties = resolver.resolveManaged(props);
    expect(cfg.get('a')).eq('bbb');
    const cfg1: ObjectProperties = await resolver.resolveManagedAsync(props);
    expect(cfg1.get('a')).eq('bbb');

    let a = false;
    try {
      resolver.resolveManaged({
        type: 'aaa'
      });
    } catch (e) {
      a = true;
    }
    expect(a).true;
    a = false;
    try {
      await resolver.resolveManagedAsync({
        type: 'aaa'
      });
    } catch (e) {
      a = true;
    }
    expect(a).true;

    const jsn = new ManagedJSON();
    jsn.value = '{"test": 1, "test1": "{{hello.a.b}}"}';

    const jsna = await resolver.resolveManagedAsync(jsn);
    expect(jsna).deep.eq({ test: 1, test1: '1' });

    const vmv = new ManagedValue();
    const svmv = new ManagedValue();
    vmv.value = svmv;
    vmv.valueType = VALUE_TYPE.MANAGED;
    svmv.value = '1234';
    svmv.valueType = VALUE_TYPE.INTEGER;
    const v1 = resolver.resolveManaged(vmv);
    expect(v1).eq(1234);
    const v2 = await resolver.resolveManagedAsync(vmv);
    expect(v2).eq(1234);

    const dtv = new ManagedValue();
    dtv.valueType = VALUE_TYPE.DATE;
    dtv.value = '2020-02-29T05:15:21.292Z';
    const dt = await resolver.resolveManagedAsync(dtv);
    expect(dt.toISOString()).eq((new Date('2020-02-29T05:15:21.292Z')).toISOString());

    expect(b).false;

    const bv = new ManagedValue();
    bv.valueType = VALUE_TYPE.BOOLEAN;
    bv.value = 'false';
    let bbv = await resolver.resolveManagedAsync(bv);
    expect(bbv).false;

    bv.value = 'true';
    bbv = await resolver.resolveManagedAsync(bv);
    expect(bbv).true;

    bv.valueType = 'helloworld';
    bbv = await resolver.resolveManagedAsync(bv);
    expect(bbv).eq('true');
  });

  it('resolve object should be ok', async () => {
    const obj = new ManagedObject();
    obj.definition = new ObjectDefinition();
    const prop1 = new ManagedProperty();
    prop1.valueType = VALUE_TYPE.MANAGED;
    prop1.name = 'first';
    const mpv1 = new ManagedValue();
    mpv1.value = '123';
    mpv1.valueType = VALUE_TYPE.NUMBER;
    prop1.value = mpv1;
    obj.definition.properties.addProperty(prop1.name, prop1);

    const prop2 = new ManagedProperty();
    prop2.valueType = VALUE_TYPE.MANAGED;
    prop2.name = 'firstList';
    const mpv2 = new ManagedList();
    const lv1 = new ManagedValue();
    lv1.value = '1234';
    lv1.valueType = VALUE_TYPE.NUMBER;
    mpv2.push(lv1);
    prop2.value = mpv2;
    obj.definition.properties.addProperty(prop2.name, prop2);

    const prop3 = new ManagedProperty();
    prop3.valueType = VALUE_TYPE.MANAGED;
    prop3.name = 'firstSet';
    const mpv3 = new ManagedSet();
    const lv2 = new ManagedValue();
    lv2.value = '123451';
    lv2.valueType = VALUE_TYPE.NUMBER;
    mpv3.add(lv2);
    prop3.value = mpv3;
    obj.definition.properties.addProperty(prop3.name, prop3);

    const prop4 = new ManagedProperty();
    prop4.valueType = VALUE_TYPE.MANAGED;
    prop4.name = 'firstMap';
    const mpv4 = new ManagedMap();
    const lv3 = new ManagedValue();
    lv3.value = '1111';
    lv3.valueType = VALUE_TYPE.NUMBER;
    mpv4.set('hello', lv3);
    prop4.value = mpv4;
    obj.definition.properties.addProperty(prop4.name, prop4);

    const context = new BaseApplicationContext();
    const resolver = new ManagedResolverFactory(context);
    const res = await resolver.resolveManagedAsync(obj);
    expect(res).is.a('object');
    expect(res.first).eq(123);
    expect(res.firstList).is.a('array');
    expect(res.firstList).deep.eq([1234]);
    expect(res.firstSet).is.a('set');
    const set = new Set();
    set.add(123451);
    expect(res.firstSet).deep.eq(set);
    const map = new Map();
    map.set('hello', 1111);
    expect(res.firstMap).deep.eq(map);

    const res1 = resolver.resolveManaged(obj);
    expect(res1).is.a('object');
    expect(res1.first).eq(123);
    expect(res1.firstList).is.a('array');
    expect(res1.firstList).deep.eq([1234]);
    expect(res1.firstSet).is.a('set');
    const set1 = new Set();
    set1.add(123451);
    expect(res1.firstSet).deep.eq(set1);
    const map1 = new Map();
    map1.set('hello', 1111);
    expect(res1.firstMap).deep.eq(map1);
  });

  it('register resolver should be ok', async () => {
    const context = new BaseApplicationContext();
    const resolver = new ManagedResolverFactory(context);
    resolver.registerResolver(new TestResolver());

    const t = new TestManaged();
    t.val = 555;
    const srt = resolver.resolveManaged(t);
    const rt = await resolver.resolveManagedAsync(t);

    expect(srt).eq('this is a test sync555');
    expect(rt).eq('this is a test555');
  });

  it('create get deps should be ok', async () => {
    const context = new BaseApplicationContext();
    const resolver = new ManagedResolverFactory(context);

    const definition = new ObjectDefinition();
    definition.id = 'hello';
    definition.name = 'helloworld';
    definition.path = class HelloWorld {
      aa = 123;
      args?: any;
      constructor(args?: any) {
        this.args = args;
      }
    };

    definition.dependsOn.push('hello1');

    const definition1 = new ObjectDefinition();
    definition1.id = 'hello1';
    definition1.name = 'helloworld1';
    definition1.path = class HelloWorld1 {
      aa = 123;
      args?: any;
      constructor(args?: any) {
        this.args = args;
      }
    };

    context.registerDefinition(definition.id, definition);
    context.registerDefinition(definition1.id, definition1);

    let r = resolver.create({ definition, args: [[ 2, 3, 4 ]]});
    expect(r.aa).eq(123);
    expect(r.args).deep.eq([2, 3, 4]);

    await resolver.destroyCache();

    r = await resolver.createAsync({ definition, args: [[ 2, 3, 4 ]]});
    expect(r.aa).eq(123);
    expect(r.args).deep.eq([2, 3, 4]);

    await resolver.destroyCache();

    const callback = sinon.spy();

    definition1.path = {
      returnNull() {
        callback('return null');
        return null;
      }
    };
    definition1.constructMethod = 'returnNull';

    try {
      await resolver.createAsync({ definition: definition1 });
    } catch (e) {
      callback(e.message);
    }

    expect(callback.withArgs('return null').calledOnce).true;
    expect(callback.withArgs('hello1 config no valid path').calledOnce).true;
  });
});
