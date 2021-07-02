'use strict'
/**
 * Module dependencies.
 */

const { pathToRegexp } = require('path-to-regexp')

/**
 * Rwrite `src` to `dst`.
 *
 * @param {String|RegExp} src
 * @param {String} dst
 * @return {Function}
 * @api public
 */

module.exports = function rewrite (src, dst) {
  const keys = [];
  let isNot = false;
  if (/^@not /.test(src)) {
    isNot = true;
    src = src.replace('@not ', '');
  }
  const re = pathToRegexp(src, keys)
  const map = toMap(keys)

  return function (ctx, next) {
    const orig = ctx.url;
    let m = re.exec(orig);
    if (isNot) {
      m = !m;
    }

    if (m) {
      ctx.url = dst.replace(/\$(\d+)|(?::(\w+))/g, (_, n, name) => {
        if (name) return m[map[name].index + 1] || ''
        return m[n] || ''
      })

      return next().then(() => {
        ctx.url = orig
      })
    }

    return next()
  }
}

/**
 * Turn params array into a map for quick lookup.
 *
 * @param {Array} params
 * @return {Object}
 * @api private
 */

function toMap (params) {
  const map = {}

  params.forEach((param, i) => {
    param.index = i
    map[param.name] = param
  })

  return map
}
