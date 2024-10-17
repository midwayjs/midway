import { DECORATORS } from '../constants';
import { Type } from '../interfaces';
import { createMixedDecorator } from './helpers';

export function ApiExtraModel(models: Type | Type[]): ClassDecorator {
  return createMixedDecorator(DECORATORS.API_EXTRA_MODEL, models);
}
