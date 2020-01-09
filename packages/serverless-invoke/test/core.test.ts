import { InvokeCore } from '../src/core';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/core.test.ts', () => {
  it('single process invoke', async () => {
    const invokeCore = new InvokeCore({
      functionName: 'http',
      handler: 'http.handler',
      baseDir: join(__dirname, 'fixtures/baseApp'),
    });

    const data = await invokeCore.invoke({});
    assert(data && /hello/.test(data));
  });
});
