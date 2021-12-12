import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';

export function ApiExcludeController(disable = true): any {
  return createCustomMethodDecorator(DECORATORS.API_EXCLUDE_CONTROLLER, [
    disable,
  ]);
}
