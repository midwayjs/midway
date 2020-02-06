import { BaseManagedResolver, ManagedResolverFactory } from '../../src/context/managedResolverFactory';
import { BaseApplicationContext } from '../../src/context/applicationContext';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { expect } from 'chai';
import { ManagedProperties, ManagedValue, ManagedJSON, ManagedObject, ManagedProperty, ManagedList, ManagedSet, ManagedMap } from '../../src/context/managed';
import { VALUE_TYPE } from '../../src/common/constants';
import { ObjectProperties } from '../../src/definitions/properties';

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

    expect(b).false;
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
});
