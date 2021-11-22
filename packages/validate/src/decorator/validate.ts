import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { VALIDATE_KEY } from '../constants';

export interface ValidateOptions {
  errorStatus?: number;
}

export function Validate(options: ValidateOptions = {}) {
  return createCustomMethodDecorator(VALIDATE_KEY, {
    options,
  });
}
