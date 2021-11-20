import { dirname, resolve, sep, posix } from 'path';
import { readFileSync } from 'fs';
import { debuglog } from 'util';

const debug = debuglog('midway:container:util');

/**
 * @since 2.0.0
 * @param env
 */
export const isDevelopmentEnvironment = env => {
  return ['local', 'test', 'unittest'].includes(env);
};

/**
 * @since 2.0.0
 */
export const getCurrentEnvironment = () => {
  return process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
};

/**
 * @param p
 * @param enabledCache
 * @since 2.0.0
 */
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
    debug(`SafeRequire Warning, message = ${err.message}`);
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
 *  @since 2.0.0
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
 * @since 2.0.0
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
  strArray = strArray.filter(item => !!item);
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
 * @since 2.0.0
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
 * @since 2.0.0
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
 * @since 2.0.0
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

/**
 * 代理目标原型属性
 * @since 2.0.0
 * @param timestamp
 */
export const getCurrentDateString = (timestamp: number = Date.now()) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

/**
 *
 * @param message
 * @since 3.0.0
 */
export const deprecatedOutput = (message: string) => {
  console.warn('DeprecationWarning: ' + message);
};
