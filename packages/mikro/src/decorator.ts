import { createCustomPropertyDecorator } from '@midwayjs/decorator';

export const ENTITY_MODEL_KEY = 'mikro:entity_model_key';

export function InjectRepository(modelKey: any, connectionName = 'default') {
  return createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}
