import { IMidwayContainer } from '@midwayjs/core';
import { TypeORMAdapter } from './adapter';
import { TypeORMAdapterConfig } from './interface';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';

export * from './adapter';
export * from './casbinRule';
export * from './casbinMongoRule';

export function createAdapter(options: TypeORMAdapterConfig) {
  return async (container: IMidwayContainer) => {
    const typeORMDataSourceManager = await container.getAsync(
      TypeORMDataSourceManager
    );
    const dataSource = typeORMDataSourceManager.getDataSource(
      options.dataSourceName
    );
    return new TypeORMAdapter(dataSource, options);
  };
}
