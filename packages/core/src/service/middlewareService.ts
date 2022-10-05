import { Provide, Scope, ScopeEnum } from '../decorator';
import {
  CommonMiddleware,
  IMiddleware,
  IMidwayContainer,
  FunctionMiddleware,
  IMidwayApplication,
} from '../interface';
import { MidwayCommonError, MidwayParameterError } from '../error';
import { isIncludeProperty, pathMatching } from '../util';
import { Types } from '../util/types';

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
      if (Types.isClass(fn) || typeof fn === 'string') {
        if (
          typeof fn === 'string' &&
          !this.applicationContext.hasDefinition(fn)
        ) {
          throw new MidwayCommonError(
            `Middleware definition of "${fn}" not found in midway container`
          );
        }
        const classMiddleware = await this.applicationContext.getAsync<
          IMiddleware<T, R, N>
        >(fn as any);
        if (classMiddleware) {
          fn = await classMiddleware.resolve(app);

          if (!fn) {
            // for middleware enabled
            continue;
          }

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
              match: classMiddleware.match?.bind(classMiddleware),
              ignore: classMiddleware.ignore?.bind(classMiddleware),
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
    const composeFn = (context: T, next?) => {
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
              /**
               * 1、return 和 ctx.body，return 的优先级更高
               * 2、如果 result 有值（非 undefined），则不管什么情况，都会覆盖当前 body，注意，这里有可能赋值 null，导致 status 为 204，会在中间件处进行修正
               * 3、如果 result 没值，且 ctx.body 已经赋值，则向 result 赋值
               */
              if (result !== undefined) {
                context['body'] = result;
              } else if (context['body'] !== undefined) {
                result = context['body'];
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
}
