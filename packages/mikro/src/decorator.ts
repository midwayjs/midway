import { DecoratorManager } from '@midwayjs/core';
import { EntityName } from '@mikro-orm/core';

export const ENTITY_MODEL_KEY = 'mikro:entity_model_key';
export const ENTITY_MANAGER_KEY = 'mikro:entity_manager_key';
export const DATA_SOURCE_KEY = 'mikro:data_source_key';

export function InjectRepository(
  modelKey: EntityName<any>,
  connectionName?: string
) {
  return DecoratorManager.createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

export function InjectEntityManager(connectionName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(ENTITY_MANAGER_KEY, {
    connectionName,
  });
}

export function InjectDataSource(dataSourceName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(DATA_SOURCE_KEY, {
    dataSourceName,
  });
}
