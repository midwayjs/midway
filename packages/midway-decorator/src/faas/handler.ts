import { savePropertyDataToClass, HANDLER_KEY } from '../common';

export function Handler(handlerMapping: string): MethodDecorator {
  return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
    savePropertyDataToClass(HANDLER_KEY, {
      method: propertykey,
      data: handlerMapping,
    }, target, propertykey);
  };
}
