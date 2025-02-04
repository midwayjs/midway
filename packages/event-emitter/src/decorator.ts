import { EVENT_KEY } from './const';
import { OnEventOptions } from './interface';
import { DecoratorManager, MetadataManager } from '@midwayjs/core';

export function OnEvent(
  event: string,
  options?: OnEventOptions
): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    DecoratorManager.saveModule(EVENT_KEY, target.constructor);
    MetadataManager.defineMetadata(
      EVENT_KEY,
      {
        event,
        options: {
          ...options,
          suppressErrors: options?.suppressErrors ?? true,
        },
      },
      target,
      propertyKey
    );
    return descriptor;
  };
}
