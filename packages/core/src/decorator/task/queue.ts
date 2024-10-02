import { Provide, DecoratorManager } from '../';
import { MODULE_TASK_QUEUE_KEY, MODULE_TASK_QUEUE_OPTIONS } from '../constant';
import { MetadataManager } from '../metadataManager';

export function Queue(options?: any): ClassDecorator {
  return function (target) {
    DecoratorManager.saveModule(MODULE_TASK_QUEUE_KEY, target);
    MetadataManager.defineMetadata(
      MODULE_TASK_QUEUE_OPTIONS,
      {
        options,
        name: target.name,
      },
      target
    );
    Provide()(target);
  };
}
