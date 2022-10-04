import { saveClassMetadata } from '../decoratorManager';
import { CATCH_KEY, MATCH_KEY } from '../constant';
import { Scope } from './objectDef';
import { Provide } from './provide';
import { ScopeEnum } from '../interface';

export function Catch(
  catchTarget?: any | any[],
  options: {
    matchPrototype?: boolean;
  } = {}
) {
  return function (target) {
    const catchTargets = catchTarget ? [].concat(catchTarget) : undefined;
    saveClassMetadata(
      CATCH_KEY,
      {
        catchTargets,
        catchOptions: options,
      },
      target
    );

    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}

export type MatchPattern<CtxOrReq = any, Res = any> =
  | ((ctxOrReq: CtxOrReq, res: Res) => boolean)
  | string
  | string[]
  | boolean;

export function Match(matchPattern: MatchPattern = true) {
  return function (target) {
    saveClassMetadata(
      MATCH_KEY,
      {
        matchPattern,
      },
      target
    );

    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
