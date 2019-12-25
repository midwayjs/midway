import { invoke } from '../';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/index.test.ts', () => {
  it('should use origin http trigger', async () => {
    const result: any = await invoke({
      runtime: 'aliyun',
      trigger: 'http',
      functionDir: join(__dirname, 'fixtures/baseApp'),
      functionName: 'http',
      data: [{ name: 'params' }],
      nolog: false,
    });
    assert(result && result.body === 'hello http world');
  });
});
