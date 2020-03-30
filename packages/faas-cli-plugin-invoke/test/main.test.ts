import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/main.test.ts', () => {
  it('invoke', async () => {
    const result: any = await (invoke as any)({
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      clean: false,
    });
    assert(result.body === 'hello http world');
  });
});
