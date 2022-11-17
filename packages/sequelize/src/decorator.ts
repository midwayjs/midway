import { createCustomPropertyDecorator, saveModule } from '@midwayjs/core';
import {
  setModelName,
  addOptions,
  Model,
  TableOptions,
} from 'sequelize-typescript';

/**
 * @deprecated
 * @param options
 * @constructor
 */
export function BaseTable<M extends Model = Model>(
  options: TableOptions<M>
): any;
export function BaseTable(target: any): void;
export function BaseTable(arg?: any) {
  if (typeof arg === 'function') {
    saveModule('sequelize:core', arg);
    annotate(arg);
  } else {
    const options = Object.assign({}, arg);
    return target => {
      saveModule('sequelize:core', target);
      annotate(target, options);
    };
  }
}

function annotate(target, options: any = {}) {
  setModelName(target.prototype, options.modelName || target.name);
  addOptions(target.prototype, options);
}

export const ENTITY_MODEL_KEY = 'sequelize:entity_model_key';
export const DATA_SOURCE_KEY = 'sequelize:data_source_key';

export function InjectRepository(
  modelKey: { new (): Model<any, any> },
  connectionName?: string
) {
  return createCustomPropertyDecorator(ENTITY_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

export function InjectDataSource(dataSourceName?: string) {
  return createCustomPropertyDecorator(DATA_SOURCE_KEY, {
    dataSourceName,
  });
}
