import { createCustomPropertyDecorator } from '@midwayjs/decorator';
import { ENTITY_MODEL_KEY } from '../interface';

export function InjectEntityModel(modelKey: any) {
  return createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
  });
}
