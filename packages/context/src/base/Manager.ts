const fnMap = new Map();
const targetMap = new Map();
const tempFn = new Map();

class DecoratorsManager {
  register(key: any, fn: Function) {
    if (fnMap.has(key)) {
      // TODO deal with duplicate symbol key
      throw new Error(`decorator ${key} repeat register`);
    }

    // TODO check function is hight-level
    fnMap.set(key, fn);

    // init
    if (!tempFn.has(key)) {
      tempFn.set(key, []);
      targetMap.set(key, []);
    }
    // Apply the decorators function for the targets before register
    const list = tempFn.get(key);
    list.map(([options, args]) => fn(options)(...args));
  }

  list(key: any): [any, string, any][] {
    return targetMap.get(key);
  }

  get(key) {
    // 已注册的装饰器
    if (fnMap.has(key)) {
      const targetList = targetMap.get(key);
      const fn = fnMap.get(key);
      return (...opts) => (...args) => {
        // 收集启动之后再
        targetList.push(args);
        return fn(...opts)(...args);
      };
    }
    // 未注册的装饰器
    return (...opts) => {
      return (...args) => {
        if (!tempFn.has(key)) {
          tempFn.set(key, []);
          targetMap.set(key, []);
        }
        const list = tempFn.get(key);
        const targetList = targetMap.get(key);
        // 启动之前，预先返回加的装饰器方法，收集需要修饰的对象
        list.push([opts, args]);
        targetList.push(args);
      };
    };
  }
}

export const decorators = new DecoratorsManager();
