import { attachClassMetadata } from '../decoratorManager';
import { CATCH_KEY } from '../constant';
import { Scope } from './objectDef';
import { ScopeEnum } from '../interface';

export function Catch(target?: any | any[]) {
  return function (target) {
    const catchTargets = [].concat(target);
    attachClassMetadata(
      CATCH_KEY,
      {
        catchTargets
      },
      target
    );

    Scope(ScopeEnum.Singleton)(target);
  };
}
