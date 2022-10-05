/**
 * fork from https://github.com/eggjs/extend2
 */
import { Types } from './types';

export function extend(...args): any {
  let options, name, src, copy, clone;
  let target = args[0];
  let i = 1;
  const length = args.length;
  let deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = args[1] || {};
    // skip the boolean and the target
    i = 2;
  } else if (
    (typeof target !== 'object' && typeof target !== 'function') ||
    target == null
  ) {
    target = {};
  }

  for (; i < length; ++i) {
    options = args[i];
    // Only deal with non-null/undefined values
    if (options == null) continue;

    // Extend the base object
    for (name in options) {
      if (name === '__proto__') continue;

      src = target[name];
      copy = options[name];

      // Prevent never-ending loop
      if (target === copy) continue;

      // Recurse if we're merging plain objects
      if (deep && copy && Types.isPlainObject(copy)) {
        clone = src && Types.isPlainObject(src) ? src : {};
        // Never move original objects, clone them
        target[name] = extend(deep, clone, copy);

        // Don't bring in undefined values
      } else if (typeof copy !== 'undefined') {
        target[name] = copy;
      }
    }
  }

  // Return the modified object
  return target;
}
