import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { remove } from 'fs-extra';
describe('/test/http.test.ts', () => {
  it('invoke', async () => {
    const baseDir = join(__dirname, 'fixtures/initializer');
    await remove(join(baseDir, './.faas_debug_tmp'));
    const result: any = await invoke({
      functionDir: baseDir,
      functionName: 'index',
      clean: false,
    });
    console.log('result', result);
    assert(true);
  });
});
