import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/noyaml.test.ts', () => {
  it('invoke', async () => {
    const result: any = await (invoke as any)({
      functionDir: join(__dirname, 'fixtures/noYaml'),
      functionName: 'service-handler'
    });
    assert(result.body === 'hello world');
  });
});
