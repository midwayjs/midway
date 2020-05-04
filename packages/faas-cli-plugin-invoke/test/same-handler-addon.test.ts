import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
describe('/test/same-handler-addon.test.ts', () => {
  it('two at same time', async () => {
    const result = await Promise.all(
      ['http', 'xxx'].map((functionName: string) => {
        return invoke({
          functionDir: join(__dirname, 'fixtures/same-handler-addon'),
          functionName,
          data: [
            {
              headers: { 'Content-Type': 'text/json'},
              method: 'GET',
              path:  '/test/xxx',
              query: {name: 123},
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
    assert(result[0].body === 'http');
    assert(result[1].body === 'xxx');
  });
});
