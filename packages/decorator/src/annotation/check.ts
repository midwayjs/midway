import * as joi from 'joi';
import { getMethodParamTypes, getClassMetadata, RULES_KEY } from '..';

export function Check(failValue?: any) {
  return function (
    target,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const origin = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const paramTypes = getMethodParamTypes(target, propertyKey);
      for (let i = 0; i < paramTypes.length; i++) {
        const item = paramTypes[i];
        const rules = getClassMetadata(RULES_KEY, item);
        if (rules) {
          const result = joi.validate(args[i], rules);
          if (result.error) {
            return failValue ? failValue : result;
          }
        }
      }
      return origin.call(this, ...args);
    };
  };
}
