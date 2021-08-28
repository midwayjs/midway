import { Provide, Inject, getConstructorInject, getPropertyInject } from '../../src';

@Provide()
class InjectChild {
}

class InjectChild2 {
}


class Test {
  constructor(@Inject() bb: any, @Inject() cc: any, @Inject() dd: InjectChild) {
    // ignore
  }

  @Inject()
  aa: any;

  @Inject()
  ee: InjectChild;

  @Inject()
  ff: InjectChild2;
}

describe('/test/annotation/inject.test.ts', () => {
  it('inject decorator should be ok', () => {
    let meta = getConstructorInject(Test);
    expect(meta).toEqual({
      0: [
        {
          args: undefined,
          key: 'inject',
          value: 'bb',
        },
      ],
      1: [
        {
          args: undefined,
          key: 'inject',
          value: 'cc',
        },
      ],
      2: [
        {
          key: 'inject',
          value: 'dd'
        }
      ]
    });

    meta = getPropertyInject(Test);
    expect(meta['aa'][0]).toEqual({
      key: 'inject',
      value: 'aa',
    });
    expect(meta['ee'][0]['key']).toEqual('inject');
    expect(meta['ee'][0]['value'].length).toEqual(32);
    expect(meta['ff'][0]).toEqual(    {
      key: 'inject',
      value: 'ff'
    });
  });
});
