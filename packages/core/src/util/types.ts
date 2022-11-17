import * as util from 'util';

const ToString = Function.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

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
