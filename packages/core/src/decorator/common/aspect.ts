import { ASPECT_KEY, attachClassMetadata, Provide, saveModule } from '../';
import { Scope } from './objectDef';
import { ScopeEnum } from '../../interface';

export function Aspect(
  aspectTarget: any | any[],
  match?: string | (() => boolean),
  priority?: number
) {
  return function (target) {
    saveModule(ASPECT_KEY, target);
    const aspectTargets = [].concat(aspectTarget);
    for (const aspectTarget of aspectTargets) {
      attachClassMetadata(
        ASPECT_KEY,
        {
          aspectTarget,
          match,
          priority,
        },
        target
      );
    }

    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
