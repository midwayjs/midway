import { Provide, Inject, getConstructorInject, getPropertyInject } from '../../src';

@Provide()
class InjectChild {
}

class Test {
  constructor(@Inject() bb: any, @Inject() cc: any, @Inject() dd: InjectChild) {
    // ignore
  }

  @Inject()
  aa: any;

  @Inject()
  ee: InjectChild;
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
    expect(meta).toEqual({
      aa: [
        {
          args: undefined,
          key: 'inject',
          value: 'aa',
        },
      ],
      'ee': [
        {
          'key': 'inject',
          'value': 'injectChild'
        }
      ]
    });
  });
});
