import { MODULE_TASK_KEY, MODULE_TASK_METADATA } from '../constant';
import { DecoratorManager } from '../decoratorManager';
import { MetadataManager } from '../metadataManager';

export function Task(options) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    DecoratorManager.saveModule(MODULE_TASK_KEY, target.constructor);
    MetadataManager.attachMetadata(
      MODULE_TASK_METADATA,
      {
        options,
        propertyKey,
        value: descriptor.value,
        name: target.constructor.name,
      },
      target
    );
  };
}
