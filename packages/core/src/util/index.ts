export function sleep(sleepTime: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sleepTime);
  });
}

// export function getPrototypeNames(target) {
//   const prototype = Object.getPrototypeOf(target);
//   let prototypeName = [];
//   if (prototype && !prototype['isPrototypeOf']) {
//     prototypeName = getPrototypeNames(prototype);
//   }
//   return prototypeName.concat(Object.getOwnPropertyNames(target));
// }

export function getPrototypeNames(obj) {
  const enumerableOwnKeys = Object.keys(obj);
  const ownKeysOnObjectPrototype = Object.getOwnPropertyNames(Object.getPrototypeOf({}));
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
};
