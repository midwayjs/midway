import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayFilterService {
  constructor(readonly applicationContext) {
  }

  async compose(middleware, name?: string) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');
    for (let fn of middleware) {
      if (typeof fn !== 'function') {
        fn = await this.applicationContext.getAsync(fn);
        if (fn.doFilter) {
          fn = fn.doFilter();
        } else if (fn.resolve) {
          fn = fn.resolve();
        } else {
          throw new TypeError('Filter must have doFilter method!');
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
        let fn = middleware[i];
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
