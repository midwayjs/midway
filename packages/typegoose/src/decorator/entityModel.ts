import { DecoratorManager, MetadataManager } from '@midwayjs/core';
import { ENTITY_MODEL_KEY, EntityOptions } from '../interface';

export function EntityModel(options?: EntityOptions): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(ENTITY_MODEL_KEY, target);
    MetadataManager.defineMetadata(ENTITY_MODEL_KEY, options, target);
  };
}
