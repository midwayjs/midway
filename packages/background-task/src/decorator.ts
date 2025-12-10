import {
  DecoratorManager,
  MetadataManager,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { BACKGROUND_TASK_KEY } from './constants';
import { IBackgroundTask } from './interface';

export function BackgroundTask(
  taskNameOrOptions?:
    | string
    | {
        taskName?: string;
        worker?: { filename: string; name?: string };
      }
): ClassDecorator {
  return function (target: any) {
    DecoratorManager.saveModule(BACKGROUND_TASK_KEY, target);
    const meta =
      typeof taskNameOrOptions === 'string'
        ? { taskName: taskNameOrOptions }
        : taskNameOrOptions || {};
    MetadataManager.defineMetadata(BACKGROUND_TASK_KEY, meta, target);
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectTask(
  taskName: string | (new (...args) => IBackgroundTask)
): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(BACKGROUND_TASK_KEY, {
    taskName,
  });
}
