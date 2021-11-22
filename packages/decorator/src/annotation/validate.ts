import { getClassExtendedMetadata, getMethodParamTypes, RULES_KEY } from '..';
import { plainToClass } from 'class-transformer';
import * as joi from 'joi';

interface MidwayValidationError extends joi.ValidationError {
  status: number;
}

interface ValidateOptions {
  isTransform?: boolean;
  errorStatus?: number;
}

export function CustomValidate(opt: ValidateOptions) {
  return (customOpt: ValidateOptions = {}) =>
    Validate({ ...opt, ...customOpt });
}

export function Validate(opt: boolean | ValidateOptions = true) {
  return function (
    target,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const origin = descriptor.value;
    const paramTypes = getMethodParamTypes(target, propertyKey);
    const options = typeof opt === 'boolean' ? { isTransform: opt } : opt;
    if (!('isTransform' in options)) {
      options.isTransform = true;
    }

    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < paramTypes.length; i++) {
        const item = paramTypes[i];
        const rules = getClassExtendedMetadata(RULES_KEY, item);
        if (rules) {
          const schema = joi.object(rules);
          const result = schema.validate(args[i]);
          if (result.error) {
            if (options.errorStatus) {
              (result.error as MidwayValidationError).status =
                options.errorStatus;
            }
            throw result.error;
          } else {
            args[i] = result.value;
          }
          // passed
          if (options.isTransform) {
            args[i] = plainToClass(item, args[i]);
          }
        }
      }
      return origin.call(this, ...args);
    };
  };
}
