import { DECORATORS } from '../constants';
import { createMixedDecorator } from './helpers';

export function ApiExcludeEndpoint(disable = true): MethodDecorator {
  return createMixedDecorator(DECORATORS.API_EXCLUDE_ENDPOINT, true);
}
