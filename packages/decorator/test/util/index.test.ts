import { Types, sleep } from '../../src';

describe('/test/util/index.test.ts', () => {
  it('should test util method', async () => {
    expect(Types.isAsyncFunction(async () => {})).toBeTruthy();
    expect(Types.isClass(class A {})).toBeTruthy();
    expect(Types.isFunction(() => {})).toBeTruthy();
    expect(Types.isGeneratorFunction(function* () {})).toBeTruthy();
    expect(Types.isMap(new Map())).toBeTruthy();
    expect(Types.isPromise(new Promise(() => {}))).toBeTruthy();

    expect(Types.isObject({})).toBeTruthy();

    expect(Types.isNumber(2)).toBeTruthy();
    expect(Types.isSet(new Set())).toBeTruthy();
    expect(Types.isRegExp(/^a/)).toBeTruthy();
    expect(Types.isProxy(new Proxy({}, {}))).toBeTruthy();
    const startTime = Date.now();
    await sleep(500);
    // 这里设置 490 是因为毫秒数有一定的偏差
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(490);
  });
});
