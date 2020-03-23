import 'reflect-metadata';
import * as joi from 'joi';
export function Check() {
  return function (target, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const origin = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
      for (let i = 0; i < paramTypes.length; i++) {
        const item = paramTypes[i];
        const rules = Reflect.getMetadata('rules', item.prototype);
        if (rules) {
          const result = joi.validate(args[i], rules);
          if (result.error) {
            return result;
          }
        }
      }
      const result = origin.call(this, ...arguments);
      return result;
    };
  };
}
