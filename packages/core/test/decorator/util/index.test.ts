import { Types, Utils } from '../../../src';

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
    await Utils.sleep(500);
    // 这里设置 490 是因为毫秒数有一定的偏差
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(490);
    expect(Types.isString('abc')).toBeTruthy();
    expect(Types.isString('')).toBeTruthy();
    expect(Types.isString(undefined)).toBeFalsy();
    expect(Types.isString({})).toBeFalsy();
  });

  it('should test toAsyncFunction', async () => {
    function getName(a: number) {
      return 'harry';
    }

    const newMethod = Utils.toAsyncFunction(getName);
    expect(await newMethod(1)).toEqual('harry');

    class A {
      _name = 'harry';
      getName() {
        return this._name;
      }
      async getAsyncName() {
        return this._name;
      }
    }

    A.prototype.getName = Utils.toAsyncFunction(A.prototype.getName) as any;
    A.prototype.getAsyncName = Utils.toAsyncFunction(A.prototype.getAsyncName) as any;
    const a = new A();
    expect(await a.getName()).toEqual('harry');
    expect(await a.getAsyncName()).toEqual('harry');
  });
});
