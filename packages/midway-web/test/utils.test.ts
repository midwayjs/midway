const { deepEqual } = require('assert');
const { getParamNames, getMethodNames, isTypeScriptEnvironment } = require('../src/utils');

describe('test/utils.test.ts', () => {
  it('#getParamNames', () => {
    const res = getParamNames(function test(a, b) {
      console.log(a, b);
    });
    deepEqual(res, ['a', 'b']);
  });

  it('#getParamNames, with null', () => {
    const res = getParamNames(function test() {});
    deepEqual(res, []);
  });

  it('#getMethodNames', () => {
    const res = getMethodNames({
      test: () => null,
      hello: () => null,
    });
    deepEqual(res, ['test', 'hello']);
  });

  it('#isTypeScriptEnvironment with ts-node', () => {
    const isTS = isTypeScriptEnvironment();

    deepEqual(isTS, true);
  });

  it('#isTypeScriptEnvironment with MIDWAY_TS_MODE', () => {
    process.env.MIDWAY_TS_MODE = 'true';
    Object.defineProperty(require.extensions, '.ts', {
      get () {
        return false;
      },
    });

    const isTS = isTypeScriptEnvironment();

    deepEqual(isTS, true);
  });
});
