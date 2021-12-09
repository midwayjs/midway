import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { DECORATORS } from '../constants';

export function ApiExtraModels(...models: Function[]) {
  return createCustomMethodDecorator(DECORATORS.API_EXTRA_MODELS, models);
}
