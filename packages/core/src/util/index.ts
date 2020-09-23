import * as util from 'util';
import { isClass as isClassType } from './isClass';

export function sleep(sleepTime = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  });
}

/**
 * get all method names from obj or it's prototype
 * @param obj
 */
export function getPrototypeNames(obj) {
  const enumerableOwnKeys = Object.keys(obj);
  const ownKeysOnObjectPrototype = Object.getOwnPropertyNames(
    Object.getPrototypeOf({})
  );
  const result = [];
  // methods on obj itself should be always included
  for (const k of enumerableOwnKeys) {
    if (typeof obj[k] === 'function') {
      result.push(k);
    }
  }
  // searching prototype chain for methods
  let proto = obj;
  do {
    proto = Object.getPrototypeOf(proto);
    const allOwnKeysOnPrototype = Object.getOwnPropertyNames(proto);
    // get methods from es6 class
    for (const k of allOwnKeysOnPrototype) {
      if (typeof obj[k] === 'function' && k !== 'constructor') {
        result.push(k);
      }
    }
  } while (proto && proto !== Object.prototype);

  // leave out those methods on Object's prototype
  return result.filter(k => ownKeysOnObjectPrototype.indexOf(k) === -1);
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

export function isClass(value) {
  return isClassType(value);
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
