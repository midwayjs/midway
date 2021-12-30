import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';

export function ApiExcludeEndpoint(disable = true): MethodDecorator {
  return createCustomMethodDecorator(
    DECORATORS.API_EXCLUDE_ENDPOINT,
    {
      disable,
    },
    false
  );
}
