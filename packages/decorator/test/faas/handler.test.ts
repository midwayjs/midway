import { Handler, FUNC_KEY, getClassMetadata } from '../../src';

class Test {
  @Handler('index.handler', { middleware: ['hello'] })
  greeting() {}

  @Handler({ funHandler: 'index.handler1', middleware: ['hello'] })
  test() {}
}

describe('/test/faas/handler.test.ts', () => {
  it('handler decorator should be ok', () => {
    const meta = getClassMetadata(FUNC_KEY, Test);
    delete meta[0].descriptor;
    delete meta[1].descriptor;
    expect(meta).toStrictEqual([
      {
        funHandler: 'index.handler',
        middleware: ['hello'],
        key: 'greeting',
      },
      {
        funHandler: 'index.handler1',
        key: 'test',
        middleware: ['hello'],
      },
    ]);
  });
});
