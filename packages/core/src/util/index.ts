import { dirname, resolve, sep, posix } from 'path';
import { readFileSync } from 'fs';
import { debuglog } from 'util';

const debug = debuglog('midway:container:util');

export const isDevelopmentEnvironment = env => {
  return ['local', 'test', 'unittest'].includes(env);
};

export const getCurrentEnvironment = () => {
  return process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
};

export const safeRequire = (p, enabledCache = true) => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }
  try {
    if (enabledCache) {
      return require(p);
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    debug('SafeRequire Warning', err.message);
    return undefined;
  }
};

/**
 *  safelyGet(['a','b'],{a: {b: 2}})  // => 2
 *  safelyGet(['a','b'],{c: {b: 2}})  // => undefined
 *  safelyGet(['a','1'],{a: {"1": 2}})  // => 2
 *  safelyGet(['a','1'],{a: {b: 2}})  // => undefined
 *  safelyGet('a.b',{a: {b: 2}})  // => 2
 *  safelyGet('a.b',{c: {b: 2}})  // => undefined
 */
export function safelyGet(
  list: string | string[],
  obj?: Record<string, unknown>
): any {
  if (arguments.length === 1) {
    return (_obj: Record<string, unknown>) => safelyGet(list, _obj);
  }

  if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
    return void 0;
  }
  const pathArrValue = typeof list === 'string' ? list.split('.') : list;
  let willReturn: any = obj;

  for (const key of pathArrValue) {
    if (typeof willReturn === 'undefined' || willReturn === null) {
      return void 0;
    } else if (typeof willReturn !== 'object') {
      return void 0;
    }
    willReturn = willReturn[key];
  }

  return willReturn;
}

/**
 * 剔除 @ 符号
 * @param provideId provideId
 */
export function parsePrefix(provideId: string) {
  if (provideId.includes('@')) {
    return provideId.substr(1);
  }
  return provideId;
}

export function getUserHome() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

export function joinURLPath(...strArray) {
  if (strArray.length === 0) {
    return '';
  }
  let p = posix.join(...strArray);
  p = p.replace(/\/+$/, '');
  if (!/^\//.test(p)) {
    p = '/' + p;
  }
  return p;
}

/**
 * 代理目标所有的原型方法，不包括构造器和内部隐藏方法
 * @param derivedCtor
 * @param constructors
 */
export function delegateTargetPrototypeMethod(
  derivedCtor: any,
  constructors: any[]
) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      if (name !== 'constructor' && !/^_/.test(name)) {
        derivedCtor.prototype[name] = function (...args) {
          return this.instance[name](...args);
        };
      }
    });
  });
}

/**
 * 代理目标原型上的特定方法
 * @param derivedCtor
 * @param methods
 */
export function delegateTargetMethod(derivedCtor: any, methods: string[]) {
  methods.forEach(name => {
    derivedCtor.prototype[name] = function (...args) {
      return this.instance[name](...args);
    };
  });
}

/**
 * 代理目标原型属性
 * @param derivedCtor
 * @param properties
 */
export function delegateTargetProperties(
  derivedCtor: any,
  properties: string[]
) {
  properties.forEach(name => {
    Object.defineProperty(derivedCtor.prototype, name, {
      get() {
        return this.instance[name];
      },
    });
  });
}
