import { completeAssign } from '../src/util';
import * as assert from 'assert';

describe('/test/util.test.ts', () => {
  it('test assign', () => {
    let a = 2;

    const data = completeAssign(
      {},
      {
        afterTest() {
          a = 1;
        },
        a: 1,
        beforeGo: 1,
      },
      {
        afterTest() {
          a = 3;
        },
        beforeHello() {},
      }
    );

    const afterTestHandlers = data['handlerStore'].get('afterTestHandler');
    assert(afterTestHandlers.length === 2);
    for (const handler of afterTestHandlers) {
      handler();
    }
    assert(a === 3);
    assert(data.a === 1);
    assert(data.beforeGo === 1);
  });
});
