import { invoke } from '../src/index';
import { join } from 'path';
import * as assert from 'assert';
import { remove } from 'fs-extra';
describe('/test/apigw.test.ts', () => {
  it('invoke', async () => {
    const baseDir = join(__dirname, 'fixtures/http');
    await remove(join(baseDir, './.faas_debug_tmp'));
    const result: any = await invoke({
      functionDir: baseDir,
      functionName: 'http',
      trigger: 'apigw',
      data: [
        {
          headers: {
            'Content-Type': 'text/json'
          },
          method: 'POST',
          query: {
            q: 'testq'
          },
          pathParameters: {
            id: 'id'
          },
          path: '/test',
          body: {
            name: 'test'
          }
        }
      ]
    });
    const resultBody = JSON.parse(result.body);
    assert(resultBody.headers['Content-Type'] === 'text/json' && resultBody.method === 'POST' && resultBody.path === '/test' && resultBody.body.name === 'test' && resultBody.pathParameters.id === 'id');
  });
});
