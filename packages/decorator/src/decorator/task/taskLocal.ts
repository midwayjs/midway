import { saveModule, attachClassMetadata } from '../../';
import {
  MODULE_TASK_TASK_LOCAL_KEY,
  MODULE_TASK_TASK_LOCAL_OPTIONS,
} from '../../constant';

export function TaskLocal(options) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    saveModule(MODULE_TASK_TASK_LOCAL_KEY, target.constructor);
    attachClassMetadata(
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
