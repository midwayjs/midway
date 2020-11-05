import { BaseRuntimeEngine } from '../src';
import * as assert from 'assert';
import * as path from 'path';

const events = [
  'beforeRuntimeStart',
  'afterRuntimeStart',
  'beforeFunctionStart',
  'afterFunctionStart',
  'beforeInvoke',
  'afterInvoke',
  'beforeClose',
];

describe('/test/runtime-events.test.ts', () => {
  before(() => {
    // 设置函数执行目录
    process.env.ENTRY_DIR = path.join(__dirname, './fixtures/common');
  });

  it('should call all events', async () => {
    const actualEvents = [];

    const runtimeEngine = new BaseRuntimeEngine();
    runtimeEngine.add(engine => {
      const ext = events.reduce((accu, key) => {
        accu[key] = () => {
          actualEvents.push(key);
        };
        return accu;
      }, {});
      engine.addRuntimeExtension(ext);
    });

    await runtimeEngine.ready();
    await runtimeEngine.close();

    assert.deepStrictEqual(actualEvents, [
      'beforeRuntimeStart',
      'afterRuntimeStart',
      'beforeFunctionStart',
      'afterFunctionStart',
      'beforeClose',
    ]);
  });
});
