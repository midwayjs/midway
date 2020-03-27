import { CodeAny } from '../src/codeAnalysis';
import { resolve } from 'path';
import * as assert from 'assert';
describe('/test/code.test.ts', () => {
  it('compareFileChange', async () => {
    const newSpec = await CodeAny({
      baseDir: resolve(__dirname, './fixtures/baseApp'),
      sourceDir: resolve(__dirname, './fixtures/baseApp/src'),
    });
    assert(newSpec.functions);
    assert(newSpec.functions['no-handler-and-path-handler'].events.length === 1);
    assert(newSpec.functions['no-handler-and-path-handler'].events[0].http.path === '/noHandlerAndPath/handler');
    assert(newSpec.functions['test-handler'].events.length === 0);
    assert(newSpec.functions['index-index'].handler === 'index.index');
    assert(newSpec.functions['multi-deco-index'].events.length === 3);
    assert(newSpec.functions['multi-deco-index'].events[0].http.path === '/api/test1');
  });
});
