const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export function getParamNames(func: () => any): RegExpMatchArray {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}

/**
 * Find methods on a given object
 *
 * @param {*} obj - object to enumerate on
 * @returns {string[]} - method names
 */
export function getMethodNames(obj: object): string[] {
  const enumerableOwnKeys: string[] = Object.keys(obj);
  const ownKeysOnObjectPrototype = Object.getOwnPropertyNames(Object.getPrototypeOf({}));
  // methods on obj itself should be always included
  const result = enumerableOwnKeys.filter(k => typeof obj[k] === 'function');

  // searching prototype chain for methods
  let proto = obj;
  do {
    proto = Object.getPrototypeOf(proto);
    const allOwnKeysOnPrototype: string[] = Object.getOwnPropertyNames(proto);
    // get methods from es6 class
    allOwnKeysOnPrototype.forEach(k => {
      if (typeof obj[k] === 'function' && k !== 'constructor') {
        result.push(k);
      }
    });
  }
  while (proto && proto !== Object.prototype);

  // leave out those methods on Object's prototype
  return result.filter(k => {
    return ownKeysOnObjectPrototype.indexOf(k) === -1;
  });
}

export function isTypeScriptEnvironment(): boolean {
  return !!require.extensions['.ts'] || process.env.MIDWAY_TS_MODE === 'true';
}
