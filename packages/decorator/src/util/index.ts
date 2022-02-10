import * as util from 'util';
import * as crypto from 'crypto';
import { camelCase, pascalCase } from './camelCase';
import { randomUUID } from './uuid';
import { safeStringify, safeParse } from './flatted';

const ToString = Function.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

function fnBody(fn) {
  return ToString.call(fn)
    .replace(/^[^{]*{\s*/, '')
    .replace(/\s*}[^}]*$/, '');
}

export function isString(value) {
  return typeof value === 'string';
}

export function isClass(fn) {
  if (typeof fn !== 'function') {
    return false;
  }

  if (/^class[\s{]/.test(ToString.call(fn))) {
    return true;
  }

  // babel.js classCallCheck() & inlined
  const body = fnBody(fn);
  return (
    /classCallCheck\(/.test(body) ||
    /TypeError\("Cannot call a class as a function"\)/.test(body)
  );
}

export function isAsyncFunction(value) {
  return util.types.isAsyncFunction(value);
}

export function isGeneratorFunction(value) {
  return util.types.isGeneratorFunction(value);
}

export function isPromise(value) {
  return util.types.isPromise(value);
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isObject(value) {
  return value !== null && typeof value === 'object';
}

export function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  const hasOwnConstructor = hasOwn.call(obj, 'constructor');
  const hasIsPrototypeOf =
    obj.constructor &&
    obj.constructor.prototype &&
    hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  let key;
  for (key in obj) {
    /**/
  }

  return typeof key === 'undefined' || hasOwn.call(obj, key);
}

export function isNumber(value) {
  return typeof value === 'number';
}

export function isProxy(value) {
  return util.types.isProxy(value);
}

export function isMap(value) {
  return util.types.isMap(value);
}

export function isSet(value) {
  return util.types.isSet(value);
}

export function isRegExp(value) {
  return util.types.isRegExp(value);
}

export function isUndefined(value) {
  return value === undefined;
}

export function isNull(value) {
  return value === null;
}

export function isNullOrUndefined(value) {
  return isUndefined(value) || isNull(value);
}

export function sleep(sleepTime = 1000) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  });
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

/**
 * get parameter name from function
 * @param func
 */
export function getParamNames(func): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .split(',')
    .map(content => {
      return content.trim().replace(/\s?=.*$/, '');
    });

  if (result.length === 1 && result[0] === '') {
    result = [];
  }
  return result;
}

/**
 * generate a lightweight 32 bit random id, enough for ioc container
 */
export function generateRandomId(): string {
  // => f9b327e70bbcf42494ccb28b2d98e00e
  return crypto.randomBytes(16).toString('hex');
}

export function merge(target: any, src: any) {
  if (!target) {
    target = src;
    src = null;
  }
  if (!target) {
    return null;
  }
  if (Array.isArray(target)) {
    return target.concat(src || []);
  }
  if (typeof target === 'object') {
    return Object.assign({}, target, src);
  }
  throw new Error('can not merge meta that type of ' + typeof target);
}

export function toAsyncFunction<T extends (...args) => any>(
  method: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  if (isAsyncFunction(method)) {
    return method as any;
  } else {
    return async function (...args) {
      return Promise.resolve(method.call(this, ...args));
    } as any;
  }
}

export const Types = {
  isClass,
  isAsyncFunction,
  isGeneratorFunction,
  isString,
  isPromise,
  isFunction,
  isObject,
  isPlainObject,
  isNumber,
  isProxy,
  isMap,
  isSet,
  isRegExp,
  isUndefined,
  isNull,
  isNullOrUndefined,
};

export const Utils = {
  sleep,
  getParamNames,
  generateRandomId,
  merge,
  camelCase,
  pascalCase,
  randomUUID,
  toAsyncFunction,
  safeStringify,
  safeParse,
};
