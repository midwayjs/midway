import {
  isAsyncFunction,
  isClass,
  isFunction,
  isGeneratorFunction,
  isMap,
  isPromise,
  isObject,
  isNumber,
  isSet,
  isRegExp,
  sleep,
  isProxy
} from '../../src';

describe('/test/util/index.test.ts', () => {
  it('should test util method', async () => {
    expect(isAsyncFunction(async () => {
    })).toBeTruthy();
    expect(isClass(class A {
    })).toBeTruthy();
    expect(isFunction(() => {
    })).toBeTruthy();
    expect(isGeneratorFunction(function* () {
    })).toBeTruthy();
    expect(isMap(new Map())).toBeTruthy();
    expect(isPromise(new Promise(() => {
    }))).toBeTruthy();

    expect(isObject({})).toBeTruthy();

    expect(isNumber(2)).toBeTruthy();
    expect(isSet(new Set())).toBeTruthy();
    expect(isRegExp(/^a/)).toBeTruthy();
    expect(isProxy(new Proxy({}, {}))).toBeTruthy();
    const startTime = Date.now();
    await sleep(500);
    // 这里设置 490 是因为毫秒数有一定的偏差
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(490);
  });
});
