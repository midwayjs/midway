import { expect } from 'chai';
import { Inject, getConstructorInject, getPropertyInject } from '../../src';

class Test {
  constructor(@Inject() bb: any, @Inject() cc: any) {
    // ignore
  }
  @Inject()
  aa: any;
}

describe('/test/annotation/inject.test.ts', () => {
  it('inject decorator should be ok', () => {
    let meta = getConstructorInject(Test);
    expect(meta).deep.eq({
      0: [
        {
          key: 'inject',
          value: 'bb'
        },
      ],
      1: [
        {
          key: 'inject',
          value: 'cc'
        },
      ]
    });

    meta = getPropertyInject(Test);
    expect(meta).deep.eq({
      aa: [{
        key: 'inject',
        value: 'aa'
      }]
    });
  });
});
