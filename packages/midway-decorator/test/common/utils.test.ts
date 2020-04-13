import {
  saveProviderId, getProviderId, DUPLICATED_INJECTABLE_DECORATOR, getPropertyInject, Provide, Inject, getConstructorInject
} from '../../src';
import { expect } from 'chai';

@Provide()
class Test {
  constructor(@Inject('@testpackage') tt: any) {
    // ignore
  }

  @Inject('@testpackage')
  hello: any;
}

describe('/test/common/util.test.ts', () => {
  it('util saveProviderId should be ok', () => {
    saveProviderId('test1', Test, true);
    const t = getProviderId(Test);
    expect(t).eq('test1');

    let s = '';
    try {
      saveProviderId('test2', Test);
    } catch (e) {
      s = e.message;
    }
    expect(s).eq(DUPLICATED_INJECTABLE_DECORATOR);
  });

  it('util savePropertyInject should be ok', () => {
    const p = getPropertyInject(Test);
    expect(p).deep.eq({
      hello: [
        {
          args: undefined,
          key: 'inject',
          value: '@testpackage:hello'
        },
      ],
    });

    const c = getConstructorInject(Test);
    expect(c).deep.eq({
      0: [{
        args: undefined,
        key: 'inject',
        value: '@testpackage:tt'
      }]
    });
  });
});
