import { MetadataManager } from '../metadataManager';
import { OBJECT_DEFINITION_KEY } from '../constant';

export function Init(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    MetadataManager.attachMetadata(
      OBJECT_DEFINITION_KEY,
      {
        initMethod: propertyKey,
      },
      target,
      propertyKey
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
      target,
      propertyKey
    );
  };
}
