import { DecoratorManager } from '@midwayjs/core';
import { Model } from 'sequelize-typescript';

export const ENTITY_MODEL_KEY = 'sequelize:entity_model_key';
export const DATA_SOURCE_KEY = 'sequelize:data_source_key';

export function InjectRepository(
  modelKey: { new (): Model<any, any> },
  connectionName?: string
) {
  return DecoratorManager.createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

export function InjectDataSource(dataSourceName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(DATA_SOURCE_KEY, {
    dataSourceName,
  });
}
