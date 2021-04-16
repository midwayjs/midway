import { saveModule, attachClassMetadata } from '@midwayjs/core';
import { MODULE_TASK_KEY, MODULE_TASK_METADATA } from '../const';

export function Task(options) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    saveModule(MODULE_TASK_KEY, target.constructor);
    attachClassMetadata(
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
