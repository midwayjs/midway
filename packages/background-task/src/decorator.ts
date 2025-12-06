import { DecoratorManager, MetadataManager, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { BACKGROUND_TASK_KEY } from './constants';
import { IBackgroundTask } from './interface';

export function BackgroundTask(taskName?: string): ClassDecorator {
  return function (target: any) {
    DecoratorManager.saveModule(BACKGROUND_TASK_KEY, target);
    MetadataManager.defineMetadata(BACKGROUND_TASK_KEY, { taskName }, target);
    Provide()(target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function InjectTask(taskName: string | (new (...args) => IBackgroundTask)): PropertyDecorator {
  return DecoratorManager.createCustomPropertyDecorator(BACKGROUND_TASK_KEY, { taskName });
}
