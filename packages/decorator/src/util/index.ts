import * as util from 'util';
import * as camelcase from 'camelcase';

const ToString = Function.prototype.toString;

function fnBody(fn) {
  return ToString.call(fn)
    .replace(/^[^{]*{\s*/, '')
    .replace(/\s*}[^}]*$/, '');
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
  return new Promise(resolve => {
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
 * 按照框架规则返回类名字
 * @param name 类名称
 */
export function classNamed(name: string) {
  return camelcase(name);
}
