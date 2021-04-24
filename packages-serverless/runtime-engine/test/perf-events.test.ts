import { BaseRuntimeEngine } from '../src';
import * as assert from 'assert';
import * as perfHooks from 'perf_hooks';
import * as path from 'path';

describe('/test/perf-events.test.ts', () => {
  beforeAll(() => {
    // 设置函数执行目录
    process.env.ENTRY_DIR = path.join(__dirname, './fixtures/common');
  });

  it('should call all events', async () => {
    const expectedMeasurementCount = 6;
    const actualEventsFuture = new Promise<string[]>(resolve => {
      let actualEvents = [];

      const observer = new perfHooks.PerformanceObserver(entryList => {
        actualEvents = actualEvents.concat(entryList.getEntries().map(it => it.name));
        if (actualEvents.length >= expectedMeasurementCount) {
          resolve(actualEvents);
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['measure'], buffered: false });
    });

    const runtimeEngine = new BaseRuntimeEngine();

    await runtimeEngine.ready();
    await runtimeEngine.close();
    const actualEvents = await actualEventsFuture;

    assert.deepStrictEqual(
      actualEvents,
      [
        'midway-faas:runtimeStart:measure',
        'midway-faas:beforeRuntimeStartHandler:measure',
        'midway-faas:afterRuntimeStartHandler:measure',
        'midway-faas:functionStart:measure',
        'midway-faas:beforeFunctionStartHandler:measure',
        'midway-faas:afterFunctionStartHandler:measure',
      ]
    );
  });
});
