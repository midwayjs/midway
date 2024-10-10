import { DecoratorManager } from '@midwayjs/core';
import { ClassLikeBone } from './interface';

export const MODEL_KEY = 'leoric:model_key';
export const DATA_SOURCE_KEY = 'leoric:data_source_key';

export function InjectDataSource(dataSourceName?: string) {
  return DecoratorManager.createCustomPropertyDecorator(DATA_SOURCE_KEY, { dataSourceName });
}

export function InjectModel(
  modelName?: string | ClassLikeBone,
  dataSourceName?: string
): (target: object, propertyKey: string | symbol) => void {
  return (target: object, propertyKey: string | symbol) => {
    if (!modelName) modelName = propertyKey.toString();
    return DecoratorManager.createCustomPropertyDecorator(MODEL_KEY, {
      modelName,
      dataSourceName,
    })(target, propertyKey);
  };
}
