
import { expect } from 'chai';
import { Func, listModule, FUNC_KEY, getClassMetadata, getObjectDefProps, ScopeEnum } from '../../src';

@Func('index.handler', { middleware: ['hello'] })
class TestFun {}

@Func({
  event: 'test',
  method: 'hello',
  path: '/ttt/tt',
  middleware: ['hello']
})
class TestFun1 {

  @Func('ttt.handler')
  fff: any;
}

describe('/test/faas/fun.test.ts', () => {
  it('fun decorator should be ok', () => {
    const meta = getClassMetadata(FUNC_KEY, TestFun);
    expect(meta).deep.eq([{
      funHandler: 'index.handler',
      middleware: ['hello'],
    }]);

    const c = getClassMetadata(FUNC_KEY, TestFun1);
    expect(c).deep.eq([
      {
        descriptor: undefined,
        funHandler: 'ttt.handler',
        key: 'fff'
      },
      {
        funHandler: '',
        event: 'test',
        method: 'hello',
        path: '/ttt/tt',
        middleware: ['hello']
      }
    ]);

    const def = getObjectDefProps(TestFun);
    expect(def).deep.eq({
      scope: ScopeEnum.Request,
    });

    const m = listModule(FUNC_KEY);
    expect(m.length).eq(3);
  });
});
