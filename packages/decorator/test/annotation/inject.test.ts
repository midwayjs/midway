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
    });
  });
});
