import { analysis } from '../src';
import { resolve } from 'path';
import * as assert from 'assert';
describe('/test/index.test.ts', () => {
  it('analysis', async () => {
    const result = await analysis(resolve(__dirname, './baseApp'));
    assert(result.functions['index']);
    assert(result.functions['index'].handler === 'index.handler');
    assert(result.functions['index'].events[0]);
    assert(result.functions['index'].events[0].http);
    assert(result.functions['index'].events[0].http.method[0] === 'GET');
    assert(result.functions['index'].events[0].http.path === '/api/test');
    assert(result.functions['index'].events[1].http.path === '/test/handler');
  });
});
