import { TYPES, sleep } from '../../src';

describe('/test/util/index.test.ts', () => {
  it('should test util method', async () => {
    expect(TYPES.isAsyncFunction(async () => {})).toBeTruthy();
    expect(TYPES.isClass(class A {})).toBeTruthy();
    expect(TYPES.isFunction(() => {})).toBeTruthy();
    expect(TYPES.isGeneratorFunction(function* () {})).toBeTruthy();
    expect(TYPES.isMap(new Map())).toBeTruthy();
    expect(TYPES.isPromise(new Promise(() => {}))).toBeTruthy();

    expect(TYPES.isObject({})).toBeTruthy();

    expect(TYPES.isNumber(2)).toBeTruthy();
    expect(TYPES.isSet(new Set())).toBeTruthy();
    expect(TYPES.isRegExp(/^a/)).toBeTruthy();
    expect(TYPES.isProxy(new Proxy({}, {}))).toBeTruthy();
    const startTime = Date.now();
    await sleep(500);
    // 这里设置 490 是因为毫秒数有一定的偏差
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(490);
  });
});
