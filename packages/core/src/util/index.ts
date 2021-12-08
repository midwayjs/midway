import { dirname, resolve, sep, posix } from 'path';
import { readFileSync } from 'fs';
import { debuglog } from 'util';
import * as transformer from 'class-transformer';
import { pathToRegexp } from './pathToRegexp';
import { MidwayCommonError } from '../error';
import { FunctionMiddleware } from '../interface';

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

/**
 * transform request object to definition type
 *
 * @param originValue
 * @param targetType
 * @since 3.0.0
 */
export const transformRequestObjectByType = (originValue: any, targetType?) => {
  if (
    targetType === undefined ||
    targetType === null ||
    targetType === Object
  ) {
    return originValue;
  }

  switch (targetType) {
    case Number:
      return Number(originValue);
    case String:
      return String(originValue);
    case Boolean:
      if (originValue === '0' || originValue === 'false') {
        return false;
      }
      return Boolean(originValue);
    default:
      if (originValue instanceof targetType) {
        return originValue;
      } else {
        const transformToInstance =
          transformer['plainToClass'] || transformer['plainToInstance'];
        return transformToInstance(
          targetType,
          originValue
        ) as typeof originValue;
      }
  }
};

export function toPathMatch(pattern) {
  if (typeof pattern === 'boolean') {
    return ctx => pattern;
  }
  if (typeof pattern === 'string') {
    const reg = pathToRegexp(pattern, [], { end: false });
    if (reg.global) reg.lastIndex = 0;
    return ctx => reg.test(ctx.path);
  }
  if (pattern instanceof RegExp) {
    return ctx => {
      if (pattern.global) pattern.lastIndex = 0;
      return pattern.test(ctx.path);
    };
  }
  if (typeof pattern === 'function') return pattern;
  if (Array.isArray(pattern)) {
    const matchs = pattern.map(item => toPathMatch(item));
    return ctx => matchs.some(match => match(ctx));
  }
  throw new MidwayCommonError(
    'match/ignore pattern must be RegExp, Array or String, but got ' + pattern
  );
}

export function pathMatching(options) {
  options = options || {};
  if (options.match && options.ignore)
    throw new MidwayCommonError(
      'options.match and options.ignore can not both present'
    );
  if (!options.match && !options.ignore) return () => true;

  const matchFn = options.match
    ? toPathMatch(options.match)
    : toPathMatch(options.ignore);

  return function pathMatch(ctx?) {
    const matched = matchFn(ctx);
    return options.match ? matched : !matched;
  };
}

/**
 * wrap function middleware with match and ignore
 * @param mw
 * @param options
 */
export function wrapMiddleware(mw: FunctionMiddleware<any, any>, options) {
  // support options.enable
  if (options.enable === false) return null;

  // support options.match and options.ignore
  if (!options.match && !options.ignore) return mw;
  const match = pathMatching(options);

  const fn = (ctx, next) => {
    if (!match(ctx)) return next();
    return mw(ctx, next);
  };
  fn._name = (mw as any)._name + 'middlewareWrapper';
  return fn;
}

function isOwnPropertyWritable(obj: any, prop: string): boolean {
  if (obj == null) return false;
  const type = typeof obj;
  if (type !== 'object' && type !== 'function') return false;
  return !!Object.getOwnPropertyDescriptor(obj, prop);
}

export function isIncludeProperty(obj: any, prop: string): boolean {
  while (obj) {
    if (isOwnPropertyWritable(obj, prop)) return true;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
}
