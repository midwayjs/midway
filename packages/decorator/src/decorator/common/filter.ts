import { saveClassMetadata } from '../../decoratorManager';
import { CATCH_KEY, MATCH_KEY } from '../../constant';
import { Scope } from './objectDef';
import { ScopeEnum } from '../../interface';
import { Provide } from './provide';

export function Catch(catchTarget?: any | any[]) {
  return function (target) {
    const catchTargets = catchTarget ? [].concat(catchTarget) : undefined;
    saveClassMetadata(
      CATCH_KEY,
      {
        catchTargets,
      },
      target
    );

    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}

export type MatchPattern<T = any> = ((ctx: T) => boolean) | string | string[];

export function Match(matchPattern: MatchPattern) {
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
