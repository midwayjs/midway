
import { expect } from 'chai';
import { HSF, listModule, HSF_KEY, getClassMetadata, getObjectDefProps, ScopeEnum } from '../../src';

@HSF({
  version: '1.0.0',
  interfaceName: 'com.test.ttt.123',
  group: 'ttt',
  namespace: 'nnn'
})
class TestFun {}

@HSF()
class TestFun1 {}

describe('/test/rpc/hsf.test.ts', () => {
  it('hsf decorator should be ok', () => {
    const meta = getClassMetadata(HSF_KEY, TestFun);
    expect(meta).deep.eq({
      version: '1.0.0',
      interfaceName: 'com.test.ttt.123',
      group: 'ttt',
      namespace: 'nnn'
    });

    const m1 = getClassMetadata(HSF_KEY, TestFun1);
    expect(m1).deep.eq({});

    const def = getObjectDefProps(TestFun);
    expect(def).deep.eq({
      scope: ScopeEnum.Request,
    });

    const m = listModule(HSF_KEY);
    expect(m.length).eq(2);
  });
});
