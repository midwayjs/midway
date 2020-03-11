import { getInvoke } from '../src';
import { Invoke } from '../src/invoke';
import { join } from 'path';
import * as assert from 'assert';
const invoke = getInvoke(Invoke, join(__dirname, 'child_debug.js'), { verbose: true });
describe('/test/main.test.ts', () => {
  it('invoke', async () => {
    const result: any = await (invoke as any)({
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      clean: false,
      debug: true,
      debugCb: () => {}
    });
    assert(result.name === 123);
  });
});
