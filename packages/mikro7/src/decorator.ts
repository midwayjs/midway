import midwayCore from '@midwayjs/core';
import { EntityName } from '@mikro-orm/core';

const { DecoratorManager } = midwayCore;

export const ENTITY_MODEL_KEY = 'mikro:entity_model_key';
export const ENTITY_MANAGER_KEY = 'mikro:entity_manager_key';
export const DATA_SOURCE_KEY = 'mikro:data_source_key';

/**
 * Inject a MikroORM v7 entity repository from the selected data source.
 */
export function InjectRepository(
  modelKey: EntityName<any>,
  connectionName?: string
) {
  return DecoratorManager.createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

/**
 * Inject a MikroORM v7 entity manager from the selected data source.
 */
export function InjectEntityManager(connectionName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(ENTITY_MANAGER_KEY, {
    connectionName,
  });
}

/**
 * Inject a MikroORM v7 data source by name.
 */
export function InjectDataSource(dataSourceName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(DATA_SOURCE_KEY, {
    dataSourceName,
  });
}
