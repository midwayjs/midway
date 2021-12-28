import {
  isAsyncFunction,
  isClass,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import {
  IMidwayContainer,
  MidwayCommonError,
  CommonMiddleware,
  FunctionMiddleware,
  pathMatching,
} from '@midwayjs/core';
import {
  IMidwayExpressContext,
  IMidwayExpressMiddleware,
  Application,
} from './interface';
import { NextFunction, Response } from 'express';

function wrapAsyncHandler(fn): any {
  if (isAsyncFunction(fn)) {
    return (req, res, next) => {
      fn(req, res, next).catch(err => {
        next(err);
      });
    };
  } else {
    return fn;
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayExpressMiddlewareService {
  constructor(readonly applicationContext: IMidwayContainer) {}

  async compose(
    middleware: Array<
      CommonMiddleware<IMidwayExpressContext, Response, NextFunction> | string
    >,
    app: Application,
    name?: string
  ) {
    if (!Array.isArray(middleware)) {
      throw new MidwayCommonError('Middleware stack must be an array');
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
        const classMiddleware =
          await this.applicationContext.getAsync<IMidwayExpressMiddleware>(
            fn as any
          );
        if (classMiddleware) {
          fn = classMiddleware.resolve(app);
          // wrap async middleware
          fn = wrapAsyncHandler(fn);
          if (!classMiddleware.match && !classMiddleware.ignore) {
            (fn as any)._name = classMiddleware.constructor.name;
            // just got fn
            newMiddlewareArr.push(fn);
          } else {
            // wrap ignore and match
            const mw = fn as any;
            const match = pathMatching({
              match: classMiddleware.match,
              ignore: classMiddleware.ignore,
            });
            fn = (req, res, next) => {
              if (!match(req)) return next();
              return mw(req, res, next);
            };
            (fn as any)._name = classMiddleware.constructor.name;
            newMiddlewareArr.push(fn);
          }
        } else {
          throw new MidwayCommonError('Middleware must have resolve method!');
        }
      } else {
        // wrap async middleware
        fn = wrapAsyncHandler(fn);
        newMiddlewareArr.push(fn);
      }
    }

    const composeFn = (
      req: IMidwayExpressContext,
      res: Response,
      next: NextFunction
    ) => {
      (function iter(i, max) {
        if (i === max) {
          return next();
        }
        newMiddlewareArr[i](req, res, iter.bind(this, i + 1, max));
      })(0, newMiddlewareArr.length);
    };
    if (name) {
      composeFn._name = name;
    }
    return composeFn;
  }
}

export function wrapMiddleware(mw: FunctionMiddleware<any, any, any>, options) {
  // support options.enable
  if (options.enable === false) return null;

  // support options.match and options.ignore
  if (!options.match && !options.ignore) return mw;
  const match = pathMatching(options);

  const fn = (req, res, next) => {
    if (!match(req)) return next();
    return mw(req, res, next);
  };
  fn._name = (mw as any)._name + 'middlewareWrapper';
  return fn;
}
