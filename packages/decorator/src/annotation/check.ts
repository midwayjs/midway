import * as joi from 'joi';

export function Check(failValue?: any) {
  return function (target, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const origin = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const paramTypes = Reflect.getMetadata('design:paramTypes', target, propertyKey);
      for (let i = 0; i < paramTypes.length; i++) {
        const item = paramTypes[i];
        const rules = Reflect.getMetadata('rules', item.prototype);
        if (rules) {
          const result = joi.validate(args[i], rules);
          if (result.error) {
            return failValue ? failValue : result;
          }
        }
      }
      return origin.call(this, ...arguments);
    };
  };
}
