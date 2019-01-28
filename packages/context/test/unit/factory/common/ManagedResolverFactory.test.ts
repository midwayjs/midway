import { BaseManagedResolver, ManagedResolverFactory } from '../../../../src/factory/common/ManagedResolverFactory';
import { BaseApplicationContext } from '../../../../src/factory/applicationContext';
import {expect} from 'chai';
import { ManagedProperties, ManagedValue, ManagedJSON } from '../../../../src/factory/common/managed';
import { VALUE_TYPE } from '../../../../src/factory/common/constants';
import { ObjectConfiguration } from '../../../../src/base/Configuration';

describe('/test/unit/factory/common/ManagedResolverFactory', () => {
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
    context.props.addProperty('hello', {a: {b: 1}});
    context.props.addProperty('hello1', 123);

    const resolver = new ManagedResolverFactory(context);

    let b = false;
    resolver.beforeEachCreated((clzz, args, context) => {
      b = true;
    });
    const props = new ManagedProperties();
    const val = new ManagedValue('bbb', VALUE_TYPE.STRING);
    props.addProperty('a', val);
    const cfg: ObjectConfiguration = resolver.resolveManaged(props);
    expect(cfg.get('a')).eq('bbb');
    const cfg1: ObjectConfiguration = await resolver.resolveManagedAsync(props);
    expect(cfg1.get('a')).eq('bbb');

    let a = false;
    try {
      resolver.resolveManaged({
        type: 'aaa'
      });
    } catch(e) {
      a = true;
    }
    expect(a).true;
    a = false;
    try {
      await resolver.resolveManagedAsync({
        type: 'aaa'
      });
    } catch(e) {
      a = true;
    }
    expect(a).true;

    const jsn = new ManagedJSON();
    jsn.value = '{"test": 1, "test1": "{{hello.a.b}}"}';

    const jsna = await resolver.resolveManagedAsync(jsn);
    expect(jsna).deep.eq({test: 1, test1: '1'});


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
});
