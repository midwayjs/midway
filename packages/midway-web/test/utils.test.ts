const assert = require('assert');
const utils = require('../src/utils');

describe('test/utils.test.ts', () => {
  it('#getParamNames', () => {
    const res = utils.getParamNames(function test(a, b) {
      console.log(a, b);
    });
    assert.deepEqual(res, ['a', 'b']);
  });

  it('#getParamNames, with null', () => {
    const res = utils.getParamNames(function test() {});
    assert.deepEqual(res, []);
  });

  it('#getMethodNames', () => {
    const res = utils.getMethodNames({
      test: () => null,
      hello: () => null,
    });
    assert.deepEqual(res, ['test', 'hello']);
  });
});
