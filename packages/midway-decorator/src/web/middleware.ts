import { attachMethodDataToClass, saveClassMetaData } from 'injection';
import { MIDDLEWARE_KEY } from '../constant';

export function middleware(middlewares: string [] | string): ClassDecorator | MethodDecorator {
  if (typeof middlewares === 'string') {
    middlewares = [middlewares];
  }

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (propertyKey) {
      // for method
      attachMethodDataToClass(MIDDLEWARE_KEY, {
        method: propertyKey,
        data: middlewares
      }, target, propertyKey);
    } else {
      saveClassMetaData(MIDDLEWARE_KEY, middlewares, target);
    }
  };
}
