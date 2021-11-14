import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { VALIDATE_KEY } from '../constants';

export function Validate(isTransform = true) {
  return createCustomMethodDecorator(VALIDATE_KEY, {
    isTransform,
  });
}
