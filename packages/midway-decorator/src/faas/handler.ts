import { savePropertyDataToClass, HANDLER_KEY } from '../common';

let inteceptor;

export function HandlerIntercept(fn) {
  inteceptor = fn;
}

export function Handler(handlerMapping: string): MethodDecorator {
  return (target: object, propertykey: string, descriptor: PropertyDescriptor) => {
    if (typeof inteceptor === 'function') {
      const method = descriptor.value;
      descriptor.value = inteceptor(target, propertykey, method, handlerMapping);
    }
    savePropertyDataToClass(HANDLER_KEY, {
      method: propertykey,
      data: handlerMapping,
    }, target, propertykey);
  };
}
