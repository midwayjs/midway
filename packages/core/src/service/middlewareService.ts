import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { CommonMiddleware, IMiddleware, IMidwayContainer, FunctionMiddleware } from '../interface';
const pathToRegexp = require('path-to-regexp');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayMiddlewareService<T> {
  constructor(readonly applicationContext: IMidwayContainer) {
  }

  async compose(middleware: Array<CommonMiddleware<T>>) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
    for (let fn of middleware) {
      if (typeof fn !== 'function') {
        const classMiddleware = await this.applicationContext.getAsync<IMiddleware<T>>(fn)
        if (classMiddleware) {
          fn = classMiddleware.resolve();
          if (!classMiddleware.match && !classMiddleware.ignore) {
            // just got fn
          } else {
            // wrap ignore and match
            const mw = fn;
            const match = pathMatching({
              match: classMiddleware.match,
              ignore: classMiddleware.ignore,
            });
            fn = (ctx, next) => {
              if (!match(ctx)) return next();
              return mw(ctx, next);
            };
          }
        } else {
          throw new TypeError('Middleware must have resolve method!');
        }
      }
    }

    /**
     * @param {Object} context
     * @return {Promise}
     * @api public
     */
    const composeFn = (context, next) => {
      // last called middleware #
      let index = -1;
      return dispatch(0);

      function dispatch(i) {
        if (i <= index) return Promise.reject(new Error('next() called multiple times'));
        index = i;
        let fn = (middleware as Array<FunctionMiddleware<T>>)[i];
        if (i === middleware.length) fn = next;
        if (!fn) return Promise.resolve();
        try {
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
    };
    composeFn._name = name;
    return composeFn;
  }
}

function pathMatching(options) {
  options = options || {};
  if (options.match && options.ignore) throw new Error('options.match and options.ignore can not both present');
  if (!options.match && !options.ignore) return () => true;

  const matchFn = options.match ? toPathMatch(options.match) : toPathMatch(options.ignore);

  return function pathMatch(ctx) {
    const matched = matchFn(ctx);
    return options.match ? matched : !matched;
  };
}

function toPathMatch(pattern) {
  if (typeof pattern === 'string') {
    const reg = pathToRegexp(pattern, [], { end: false });
    if (reg.global) reg.lastIndex = 0;
    return ctx => reg.test(ctx.path);
  }
  if (pattern instanceof RegExp) {
    return ctx => {
      if (pattern.global) pattern.lastIndex = 0;
      return pattern.test(ctx.path);
    };
  }
  if (typeof pattern === 'function') return pattern;
  if (Array.isArray(pattern)) {
    const matchs = pattern.map(item => toPathMatch(item));
    return ctx => matchs.some(match => match(ctx));
  }
  throw new Error('match/ignore pattern must be RegExp, Array or String, but got ' + pattern);
}
