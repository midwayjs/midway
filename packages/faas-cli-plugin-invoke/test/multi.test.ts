import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { pathExists, remove } from 'fs-extra';

describe('/test/multi.test.ts', () => {
  beforeEach(async () => {
    const dirs = [join(__dirname, './fixtures/multiApp')];
    for (const dir of dirs) {
      if (await pathExists(join(dir, '.faas_debug_tmp'))) {
        await remove(join(dir, '.faas_debug_tmp'));
      }
    }
  });

  it('two at same time', async () => {
    const result = await Promise.all(
      ['http', 'http'].map((functionName: string) => {
        return invoke({
          functionDir: join(__dirname, 'fixtures/multiApp'),
          functionName,
          data: [
            {
              headers: { 'Content-Type': 'text/json'},
              method: 'GET',
              path:  '/test/xxx',
              queries: {name: 123},
              body: {
                name: 'test'
              }
            }
          ],
          clean: false,
        });
      })
    );
    assert(result.length === 2);
    const data = JSON.parse(result[0].body);
    assert(data.method === 'GET' && data.path === '/test/xxx');
  });
});
