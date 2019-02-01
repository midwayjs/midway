/**
 * Midway Loading 文件加载
 */
const debug = require('debug')('midway:loading');
const is = require('is-type-of');
const globby = require('globby');
const extend = require('extend2');
const assert = require('assert');
const path = require('path');

function inject(obj, properties, result) {
  if (!properties || properties.length === 0) {
    return;
  }
  const property = properties.shift();
  if (properties.length === 0) {
    obj[property] = result;
    return;
  }
  obj[property] = obj[property] || {};
  inject(obj[property], properties, result);
}

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

  const into = is.object(options.into) && options.into;
  const flatten = !!options.flatten;
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

      if (into) {
        // 文件名校验规则考虑操作系统兼容性
        // 参考 http://superuser.com/questions/358855/what-characters-are-safe-in-cross-platform-file-names-for-linux-windows-and-os
        const reg = /^[a-z][\.a-z0-9_-]*$/i;  // 不支持 comma(,)
        let properties = name.replace(/\.js$/, '')
          .split('/')
          .map(property => {
            if (!reg.test(property)) {
              throw new Error(`${property} does not match ${reg} in ${name}`);
            }
            const result = property.replace(/[_-][a-z]/ig, function (s) {
              return s.substring(1).toUpperCase();
            });
            return result;
          });

        properties = options.propertyHandler(properties, name, file);

        if (properties && properties.length) {
          if (flatten) {
            into[properties.join('.')] = result;
          } else {
            inject(into, properties, result);
          }
        }
      }

      debug(`LoadFiles => [${file}]: load success`);
      if (options.target) {
        extend(true, options.target, result);
      }
    });
  });

  return results;
}
