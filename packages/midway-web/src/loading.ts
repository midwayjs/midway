/**
 * Midway Loading 文件加载
 */
const debug = require('debug')('midway:loading');
const is = require('is-type-of');
const globby = require('globby');
const extend = require('extend2');
const assert = require('assert');
const path = require('path');

export function loading(files, options) {
  assert(options.loadDirs, `options.loadDirs is required`);

  options = Object.assign({
    call: true,
    ignore(exports, file, dir) {
      return false;
    },
    resultHandler(result, file, dir, exports) {
      return result;
    },
    propertyHandler(properties, name, file) {
      return properties;
    }
  }, options);

  files = [].concat(files);

  const results = [];
  const loadDirs = [].concat(options.loadDirs);

  loadDirs.forEach((dir) => {
    const fileResults = globby.sync(files, {cwd: dir});

    fileResults.forEach((name) => {
      const file = path.join(dir, name);
      debug(`LoadFiles => [${file}]: will load`);
      const exports = require(file);
      if (options.ignore(exports, file, dir)) {
        return;
      }
      let result = exports;
      if (options.call && is.function(exports) && !is.class(exports)) {
        result = exports.apply(null, [].concat(options.inject));
      }
      result = options.resultHandler(result, file, dir, exports);
      results.push(result);

      debug(`LoadFiles => [${file}]: load success`);
      if (options.target) {
        extend(true, options.target, result);
      }
    });
  });

  return results;
}
