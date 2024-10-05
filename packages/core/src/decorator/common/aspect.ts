import { ASPECT_KEY, DecoratorManager, Provide, Scope } from '../';
import { ScopeEnum } from '../../interface';
import { MetadataManager } from '../metadataManager';

export function Aspect(
  aspectTarget: any | any[],
  match?: string | (() => boolean),
  priority?: number
) {
  return function (target) {
    DecoratorManager.saveModule(ASPECT_KEY, target);
    const aspectTargets = [].concat(aspectTarget);
    for (const aspectTarget of aspectTargets) {
      MetadataManager.attachMetadata(
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
