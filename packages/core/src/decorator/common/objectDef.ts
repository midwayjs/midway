import { Provide } from './provide';
import { ScopeEnum } from '../../interface';
import { MetadataManager } from '../metadataManager';
import { OBJECT_DEFINITION_KEY } from '../constant';

export function Init(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    MetadataManager.attachMetadata(
      OBJECT_DEFINITION_KEY,
      {
        initMethod: propertyKey,
      },
      target
    );
  };
}

export function Destroy(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    MetadataManager.attachMetadata(
      OBJECT_DEFINITION_KEY,
      {
        destroyMethod: propertyKey,
      },
      target
    );
  };
}

export function Scope(
  scope: ScopeEnum,
  scopeOptions?: { allowDowngrade?: boolean }
): ClassDecorator {
  return function (target: any): void {
    MetadataManager.attachMetadata(
      OBJECT_DEFINITION_KEY,
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
