import { Autowire, InjectionPoint } from '../../../../src/factory/common/Autowire';
import { expect } from 'chai';

describe('/test/unit/factory/common/Autowire', () => {
  it('inject point should be ok', () => {
    const point = InjectionPoint.create('hello', 1234);
    expect(point).not.null;
    expect(point).not.undefined;

    expect(point.defaultValue).eq(1234);
    expect(point.id).eq('hello');
  });

  it('patchDollar should be ok', () => {
    const aa = {'$hh': null};
    const context = {
      get() {
        return 'ddd';
      }
    };
    Autowire.patchDollar(aa, context as any);

    Autowire.patchDollar(aa, context as any);

    expect(aa.$hh).eq('ddd');
    expect((aa as any).__patched_dollar__).true;

    const bb = {'$cc': null};
    Autowire.patchDollar(bb, context as any, function (key) { return 'ccc'; });
    expect(bb.$cc).eq('ccc');
  });
});
