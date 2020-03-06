
import { expect } from 'chai';
import { Handler, getPropertyDataFromClass, HANDLER_KEY } from '../../src';

class Test {

  @Handler('/aaa')
  handler() {}
}

describe('/test/faas/handler.test.ts', () => {
  it('handler decorator should be ok', () => {
    const data = getPropertyDataFromClass(HANDLER_KEY, Test, 'handler');
    expect(data).deep.eq({
      method: 'handler',
      data: '/aaa',
    });
  });
});
