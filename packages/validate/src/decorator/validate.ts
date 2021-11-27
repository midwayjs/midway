import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { VALIDATE_KEY } from '../constants';
import * as Joi from 'joi';

export interface ValidateOptions {
  errorStatus?: number;
  validateOptions?: Joi.ValidationOptions;
}

export function Validate(options: ValidateOptions = {}) {
  return createCustomMethodDecorator(VALIDATE_KEY, {
    options,
  });
}
