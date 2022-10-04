import { createCustomPropertyDecorator } from '@midwayjs/core';
import { EntityName } from '@mikro-orm/core';

export const ENTITY_MODEL_KEY = 'mikro:entity_model_key';

export function InjectRepository(
  modelKey: EntityName<any>,
  connectionName?: string
) {
  return createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}
