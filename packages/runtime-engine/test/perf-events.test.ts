
import { BaseRuntimeEngine } from '../src';
import * as assert from 'assert';
import * as perfHooks from 'perf_hooks';
import * as path from 'path';

describe('/test/perf-events.test.ts', () => {
  before(() => {
    // 设置函数执行目录
    process.env.ENTRY_DIR = path.join(__dirname, './fixtures/common');
  });

  it('should call all events', async () => {
    let actualEvents = [];
    const observer = new perfHooks.PerformanceObserver((entryList) => {
      actualEvents = actualEvents.concat(entryList.getEntries());
    });
    observer.observe({ entryTypes: ['measure'] });

    const runtimeEngine = new BaseRuntimeEngine();

    await runtimeEngine.ready();
    await runtimeEngine.close();

    assert.deepStrictEqual(actualEvents.map(it => it.name), [
      'midway-faas:runtimeStart:measure',
      'midway-faas:functionStart:measure',
      'midway-faas:beforeRuntimeStartHandler:measure',
      'midway-faas:afterRuntimeStartHandler:measure',
      'midway-faas:beforeFunctionStartHandler:measure',
      'midway-faas:afterFunctionStartHandler:measure',
    ]);

    observer.disconnect();
  });
});
