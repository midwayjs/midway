import { getClassExtendedMetadata, getMethodParamTypes, RULES_KEY } from '..';
import { plainToClass } from 'class-transformer';
import { object, ValidationError } from 'joi';

interface MidwayValidationError extends ValidationError {
  status: number;
}

export function Validate(isTransform = true) {
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
        const rules = getClassExtendedMetadata(RULES_KEY, item);
        if (rules) {
          const schema = object(rules);
          const result = schema.validate(args[i]);
          if (result.error) {
            // HTTP status code: 422 Unprocessable Entity
            (result.error as MidwayValidationError).status = 422;
            throw result.error;
          } else {
            args[i] = result.value;
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
