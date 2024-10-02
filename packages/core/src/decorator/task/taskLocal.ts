import {
  MODULE_TASK_TASK_LOCAL_KEY,
  MODULE_TASK_TASK_LOCAL_OPTIONS,
} from '../constant';
import { DecoratorManager } from '../decoratorManager';
import { MetadataManager } from '../metadataManager';

export function TaskLocal(options) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    DecoratorManager.saveModule(MODULE_TASK_TASK_LOCAL_KEY, target.constructor);
    MetadataManager.attachMetadata(
      MODULE_TASK_TASK_LOCAL_OPTIONS,
      {
        options,
        propertyKey,
        value: descriptor.value,
      },
      target
    );
  };
}
