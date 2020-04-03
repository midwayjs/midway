import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { remove } from 'fs-extra';
describe('/test/noyaml.test.ts', () => {
  it('invoke', async () => {
    const baseDir = join(__dirname, 'fixtures/noYaml');
    await remove(join(baseDir, './.faas_debug_tmp'));
    const result: any = await (invoke as any)({
      functionDir: join(__dirname, 'fixtures/noYaml'),
      functionName: 'service'
    });
    assert(result.body === 'hello world');
  });
});
