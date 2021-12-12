import { isClass, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import {
  CommonMiddleware,
  IMiddleware,
  IMidwayContainer,
  FunctionMiddleware,
  IMidwayApplication,
} from '../interface';
import { MidwayCommonError, MidwayParameterError } from '../error';
import { isIncludeProperty, pathMatching } from '../util';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayMiddlewareService<T, R, N = unknown> {
  constructor(readonly applicationContext: IMidwayContainer) {}

  async compose(
    middleware: Array<CommonMiddleware<T, R, N> | string>,
    app: IMidwayApplication,
    name?: string
  ) {
    if (!Array.isArray(middleware)) {
      throw new MidwayParameterError('Middleware stack must be an array');
    }

    const newMiddlewareArr = [];

    for (let fn of middleware) {
      if (isClass(fn) || typeof fn === 'string') {
        if (
          typeof fn === 'string' &&
          !this.applicationContext.hasDefinition(fn)
        ) {
          throw new MidwayCommonError(
            'Middleware definition not found in midway container'
          );
        }
        const classMiddleware = await this.applicationContext.getAsync<
          IMiddleware<T, R, N>
        >(fn as any);
        if (classMiddleware) {
          fn = classMiddleware.resolve(app);
          if (!classMiddleware.match && !classMiddleware.ignore) {
            if (!fn.name) {
              (fn as any)._name = classMiddleware.constructor.name;
            }
            // just got fn
            newMiddlewareArr.push(fn);
          } else {
            // wrap ignore and match
            const mw = fn;
            const match = pathMatching({
              match: classMiddleware.match,
              ignore: classMiddleware.ignore,
            });
            (fn as any) = (ctx, next, options) => {
              if (!match(ctx)) return next();
              return mw(ctx, next, options);
            };
            (fn as any)._name = classMiddleware.constructor.name;
            newMiddlewareArr.push(fn);
          }
        } else {
          throw new MidwayCommonError('Middleware must have resolve method!');
        }
      } else {
        newMiddlewareArr.push(fn);
      }
    }

    /**
     * @param {Object} context
     * @param next
     * @return {Promise}
     * @api public
     */
    const composeFn = (context, next?) => {
      const supportBody = isIncludeProperty(context, 'body');
      // last called middleware #
      let index = -1;
      return dispatch(0);

      function dispatch(i) {
        if (i <= index)
          return Promise.reject(
            new MidwayCommonError('next() called multiple times')
          );
        index = i;
        let fn = (newMiddlewareArr as Array<FunctionMiddleware<T, R, N>>)[i];
        if (i === newMiddlewareArr.length) fn = next;
        if (!fn) return Promise.resolve();
        try {
          if (supportBody) {
            return Promise.resolve(
              fn(context, dispatch.bind(null, i + 1), {
                index,
              } as any)
            ).then(result => {
              // need to set body
              if (context.body && !result) {
                result = context.body;
              } else if (result && context.body !== result) {
                context.body = result;
              }
              return result;
            });
          } else {
            return Promise.resolve(
              fn(context, dispatch.bind(null, i + 1), {
                index,
              } as any)
            );
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
    };
    if (name) {
      composeFn._name = name;
    }
    return composeFn;
  }

  public getMiddlewareName(mw) {
    return mw.name ?? mw._name;
  }
}
