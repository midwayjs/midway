import {
  Func,
  listModule,
  FUNC_KEY,
  getClassMetadata,
  getObjectDefProps,
  ScopeEnum,
} from '../../src';

@Func('index.handler', { middleware: ['hello'] })
class TestFun {}

class TestFun1 {
  @Func('ttt.handler')
  fff: any;
}

describe('/test/faas/fun.test.ts', () => {
  it('fun decorator should be ok', () => {
    const meta = getClassMetadata(FUNC_KEY, TestFun);
    expect(meta).toStrictEqual([
      {
        funHandler: 'index.handler',
        middleware: ['hello'],
      },
    ]);

    const c = getClassMetadata(FUNC_KEY, TestFun1);
    expect(c).toStrictEqual([
      {
        descriptor: undefined,
        funHandler: 'ttt.handler',
        key: 'fff',
      },
    ]);

    const def = getObjectDefProps(TestFun);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(FUNC_KEY);
    expect(m.length).toEqual(2);
  });
});
