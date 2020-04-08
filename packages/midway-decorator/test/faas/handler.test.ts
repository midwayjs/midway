
import { expect } from 'chai';
import { Handler, FUNC_KEY, getClassMetadata } from '../../src';

class Test {
  @Handler('index.handler', { middleware: ['hello'] })
  greeting() {}
}

describe('/test/faas/handler.test.ts', () => {
  it('handler decorator should be ok', () => {
    const meta = getClassMetadata(FUNC_KEY, Test);
    delete meta[0].descriptor;
    expect(meta).deep.eq([{
      funHandler: 'index.handler',
      middleware: ['hello'],
      key: 'greeting',
    }]);
  });
});
