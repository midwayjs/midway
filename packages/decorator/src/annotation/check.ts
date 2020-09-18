import * as joi from 'joi';
import { getClassMetadata, getMethodParamTypes, RULES_KEY } from '..';
import { plainToClass } from 'class-transformer';

export function Check(isTransform = true) {
  return function (
    target,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const origin = descriptor.value;
    const paramTypes = getMethodParamTypes(target, propertyKey);

    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < paramTypes.length; i++) {
        const item = paramTypes[i];
        const rules = getClassMetadata(RULES_KEY, item);
        if (rules) {
          const result = joi.validate(args[i], rules);
          if (result.error) {
            throw new Error(result.error as any);
          }
          // passed
          if (isTransform) {
            args[i] = plainToClass(item, args[i]);
          }
        }
      }
      return origin.call(this, ...args);
    };
  };
}
