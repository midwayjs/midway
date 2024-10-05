import { SCOPE_KEY } from '../constant';
import { ScopeEnum } from '../../interface';
import { MetadataManager } from '../metadataManager';
import { Provide } from './provide';

export function Scope(
  scope: ScopeEnum,
  scopeOptions?: { allowDowngrade?: boolean }
): ClassDecorator {
  return function (target: any): void {
    MetadataManager.defineMetadata(
      SCOPE_KEY,
      { scope, ...scopeOptions },
      target
    );
  };
}

export function Singleton(): ClassDecorator {
  return function (target: any): void {
    Scope(ScopeEnum.Singleton)(target);
    Provide()(target);
  };
}
