import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { pathExists, remove, existsSync } from 'fs-extra';

describe('/test/static-files.test.ts', () => {
  beforeEach(async () => {
    const dirs = [join(__dirname, './fixtures/baseApp')];
    for (const dir of dirs) {
      if (await pathExists(join(dir, '.faas_debug_tmp'))) {
        await remove(join(dir, '.faas_debug_tmp'));
      }
    }
  });
  it('invoke', async () => {
    const dir = join(__dirname, 'fixtures/baseApp');
    const dist = join(dir, '.faas_debug_tmp/dist');
    const result: any = await (invoke as any)({
      functionDir: dir,
      functionName: 'http',
      clean: false,
    });
    assert(result.body === 'hello http world');
    assert(existsSync(join(dist, 'a.txt')));
    assert(existsSync(join(dist, 'view/a.html')));
    assert(existsSync(join(dist, 'view/b.json')));
  });
});
