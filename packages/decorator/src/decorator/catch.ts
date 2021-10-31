import { attachClassMetadata } from '../decoratorManager';
import { CATCH_KEY } from '../constant';
import { Scope } from './objectDef';
import { ScopeEnum } from '../interface';
import { Provide } from './provide';

export function Catch(catchTarget?: any | any[]) {
  return function (target) {
    const catchTargets = [].concat(catchTarget);
    attachClassMetadata(
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
