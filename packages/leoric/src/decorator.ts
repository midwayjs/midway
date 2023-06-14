import { createCustomPropertyDecorator } from '@midwayjs/core';

export const MODEL_KEY = 'leoric:model_key';
export const DATA_SOURCE_KEY = 'leoric:data_source_key';

export function InjectDataSource(dataSourceName?: string) {
  return createCustomPropertyDecorator(DATA_SOURCE_KEY, { dataSourceName });
}

export function InjectModel(
  modelName?: string
): (target: object, propertyKey: string | symbol) => void {
  return (target: object, propertyKey: string | symbol) => {
    if (!modelName) modelName = propertyKey.toString();
    return createCustomPropertyDecorator(MODEL_KEY, { modelName })(
      target,
      propertyKey
    );
  };
}
