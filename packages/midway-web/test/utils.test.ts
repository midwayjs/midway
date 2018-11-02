const { deepEqual } = require('assert');
const { getParamNames, getMethodNames } = require('../src/utils');

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
});
