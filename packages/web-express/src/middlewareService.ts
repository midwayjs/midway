import { isClass, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import {
  IMidwayContainer,
  pathToRegexp,
  MidwayCommonError,
  CommonMiddleware,
} from '@midwayjs/core';
import { IMidwayExpressContext, IMidwayExpressMiddleware } from './interface';
import { NextFunction, Response } from 'express';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayExpressMiddlewareService {
  constructor(readonly applicationContext: IMidwayContainer) {}

  async compose(
    middleware: Array<
      CommonMiddleware<IMidwayExpressContext, Response, NextFunction> | string
    >,
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
          fn = classMiddleware.resolve();
          if (!classMiddleware.match && !classMiddleware.ignore) {
            (fn as any)._name = classMiddleware.constructor.name;
            // just got fn
            newMiddlewareArr.push(fn);
          } else {
            // wrap ignore and match
            const mw = fn;
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
          throw new MidwayCommonError(
            'Middleware must have resolve method!'
          );
        }
      } else {
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

export function pathMatching(options) {
  options = options || {};
  if (options.match && options.ignore)
    throw new MidwayCommonError(
      'options.match and options.ignore can not both present'
    );
  if (!options.match && !options.ignore) return () => true;

  const matchFn = options.match
    ? toPathMatch(options.match)
    : toPathMatch(options.ignore);

  return function pathMatch(ctx?) {
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
  throw new MidwayCommonError(
    'match/ignore pattern must be RegExp, Array or String, but got ' + pattern
  );
}
